'use client'

import React from "react"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Signed in successfully!',
      })

      router.push('/')
      router.refresh()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      })
    } finally {
      setIsLoading(false)
    }
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md border-4 border-foreground bg-background" style={{ boxShadow: '8px 8px 0px rgba(0,0,0,0.15)' }}>
        <div className="border-b-4 border-foreground bg-accent p-6">
          <h1 className="text-3xl font-black text-accent-foreground text-center">Welcome Back</h1>
          <p className="text-center text-sm font-bold text-accent-foreground mt-2">
            Sign in to access your courses and continue learning
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-black text-foreground text-sm">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className="border-4 border-foreground focus:ring-4 focus:ring-offset-2 focus:ring-secondary font-semibold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-black text-foreground text-sm">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className="border-4 border-foreground focus:ring-4 focus:ring-offset-2 focus:ring-secondary font-semibold"
              />
            </div>

            <Button type="submit" className="w-full border-4 border-foreground bg-accent text-accent-foreground font-black text-base py-2" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="border-t-2 border-foreground" />

            <p className="text-center text-sm font-semibold text-foreground">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="font-black text-primary hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
