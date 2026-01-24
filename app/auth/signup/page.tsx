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
import { createClient } from '@/lib/supabase/client'


export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            window.location.origin,
        },
      })

      if (authError) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: authError.message,
        })
        return
      }

      // Create user profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
          })

        if (profileError) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to create profile',
          })
          return
        }
      }

      toast({
        title: 'Success',
        description: 'Check your email to confirm your account',
      })

      router.push('/')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Signup failed',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md border-4 border-foreground bg-background" style={{ boxShadow: '8px 8px 0px rgba(0,0,0,0.15)' }}>
        <div className="border-b-4 border-foreground bg-secondary p-6">
          <h1 className="text-3xl font-black text-secondary-foreground">Create Account</h1>
          <p className="text-sm font-bold text-secondary-foreground mt-2">Join RIIDL and start learning today</p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="font-black text-foreground text-sm">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
                className="border-4 border-foreground focus:ring-4 focus:ring-offset-2 focus:ring-secondary font-semibold"
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-black text-foreground text-sm">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="border-4 border-foreground focus:ring-4 focus:ring-offset-2 focus:ring-secondary font-semibold"
              />
            </div>

            <Button type="submit" className="w-full border-4 border-foreground bg-primary text-primary-foreground font-black text-base py-2" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="border-t-2 border-foreground" />

            <p className="text-center text-sm font-semibold text-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-black text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
