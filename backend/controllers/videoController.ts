
import { Request, Response } from 'express';
import supabase from '../lib/supabase.js';

interface Topic {
    id: string;
    course_id: string;
    video_url: string;
}

interface Course {
    id: string;
    is_published: boolean;
}

// Helper to fetch topic
async function getTopic(topicId: string): Promise<Topic | null> {
    const { data: topic, error } = await supabase
        .from('topics')
        .select('id, course_id, video_url')
        .eq('id', topicId)
        .single();

    if (error || !topic) return null;
    return topic as Topic;
}

// Helper to fetch course
async function getCourse(courseId: string): Promise<Course | null> {
    const { data: course, error } = await supabase
        .from('courses')
        .select('id, is_published')
        .eq('id', courseId)
        .single();

    if (error || !course) return null;
    return course as Course;
}

export const streamVideo = async (req: Request, res: Response) => {
    try {
        const { url, topicId } = req.query;

        // Type checking for query parameters
        if (!url || !topicId || typeof url !== 'string' || typeof topicId !== 'string') {
            return res.status(400).json({ error: 'Missing parameters or invalid types' });
        }

        if (!url.startsWith('http')) {
            return res.status(400).json({ error: 'Invalid video URL' });
        }

        // 1. Fetch topic
        const topic = await getTopic(topicId);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        // 2. Fetch course
        const course = await getCourse(topic.course_id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // 3. Authorization check (optional based on requirements)
        // if (!course.is_published) ...

        // 4. Forward request to upstream
        const rangeHeader = req.headers.range;
        const fetchHeaders: Record<string, string> = {
            'User-Agent': (req.headers['user-agent'] as string) || ''
        };
        if (rangeHeader) {
            fetchHeaders['Range'] = rangeHeader;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: fetchHeaders
        });

        if (!response.ok && response.status !== 206) {
            return res.status(500).json({ error: 'Failed to fetch video' });
        }

        // 5. Build response headers
        const contentType = response.headers.get('content-type') || 'video/mp4';
        const contentLength = response.headers.get('content-length');
        const contentRange = response.headers.get('content-range');

        res.status(response.status);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Accept-Ranges', 'bytes');

        if (contentLength) res.setHeader('Content-Length', contentLength);
        if (contentRange) res.setHeader('Content-Range', contentRange);

        // 6. Pipe data
        if (response.body) {
            // For Node implementation of Fetch (recent Node versions or Undici)
            // @ts-ignore - ReadableStream/Web Streams API types might conflict with Node streams depending on environment, using implicit handling or any
            const reader = response.body.getReader();

            const pump = async () => {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        if (value) res.write(value);
                    }
                    res.end();
                } catch (err) {
                    console.error('Stream error', err);
                    res.end();
                }
            };
            pump();
        } else {
            res.end();
        }


    } catch (error) {
        console.error('Video streaming error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

export const getSignedUrl = async (req: Request, res: Response) => {
    try {
        const { topicId } = req.query;
        // userId from auth middleware
        const userId = req.user?.userId;

        if (!topicId || typeof topicId !== 'string') {
            return res.status(400).json({ error: 'Missing topic ID' });
        }

        const topic = await getTopic(topicId);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        if (!topic.video_url) {
            return res.status(404).json({ error: 'Video not available' });
        }

        const supabaseStoragePattern = /supabase\.co\/storage\/v1\/object\/(public|sign)\/([^\/]+)\/(.+)/;
        const match = topic.video_url.match(supabaseStoragePattern);

        if (match) {
            const bucketName = match[2];
            const filePath = match[3];

            const { data, error } = await supabase.storage
                .from(bucketName)
                .createSignedUrl(filePath, 3600);

            if (error) {
                console.error('Failed to create signed URL:', error);
                return res.status(500).json({ error: 'Failed to generate video URL' });
            }

            return res.json({
                url: data.signedUrl,
                expiresIn: 3600
            });
        } else {
            return res.json({
                url: topic.video_url,
                expiresIn: null
            });
        }

    } catch (error) {
        console.error('Signed URL error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createVideo = async (req: Request, res: Response) => {
    try {
        const { title, url, courseId } = req.body;

        // Validation
        if (!title || !url || !courseId) {
            return res.status(400).json({ error: 'Missing required fields: title, url, courseId' });
        }

        // 1. Insert into topics table
        // Note: Assuming 'topics' table has columns: title, video_url, course_id
        const { data, error } = await supabase
            .from('topics')
            .insert([
                {
                    title,
                    video_url: url,
                    course_id: courseId
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Database insert error:', error);
            return res.status(500).json({ error: 'Failed to create video record' });
        }

        return res.status(201).json({
            message: 'Video created successfully',
            data
        });

    } catch (error) {
        console.error('Create video error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
