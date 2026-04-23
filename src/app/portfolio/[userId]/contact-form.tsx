'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  userId: string;
}

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm({ userId }: ContactFormProps) {
  const { toast } = useToast();
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setSubmissionState('submitting');
    setStatusMessage(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || 'Your message could not be sent right now.');
      }

      setSubmissionState('success');
      const successMessage = 'Thank you for getting in touch. I will get back to you shortly.';
      setStatusMessage(successMessage);
      toast({
        title: 'Message Sent!',
        description: successMessage,
      });
      form.reset();
    } catch (error: any) {
      const message = error?.message || 'Could not send message. Please try again later.';
      setSubmissionState('error');
      setStatusMessage(message);
      toast({
        variant: 'destructive',
        title: 'Message Failed',
        description: message,
      });
    }
  };

  const isSubmitting = submissionState === 'submitting';
  const hasSuccess = submissionState === 'success';
  const hasError = submissionState === 'error';

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="name" className="sr-only">
            Your Name
          </label>
          <Input
            id="name"
            placeholder="Your Name"
            {...form.register('name')}
            className="bg-background"
            disabled={isSubmitting}
          />
          {form.formState.errors.name && (
            <p className="mt-2 text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="sr-only">
            Your Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Your Email"
            {...form.register('email')}
            className="bg-background"
            disabled={isSubmitting}
          />
          {form.formState.errors.email && (
            <p className="mt-2 text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="message" className="sr-only">
            Your Message
          </label>
          <Textarea
            id="message"
            placeholder="Your Message"
            {...form.register('message')}
            rows={6}
            className="bg-background"
            disabled={isSubmitting}
          />
          {form.formState.errors.message && (
            <p className="mt-2 text-sm text-destructive">{form.formState.errors.message.message}</p>
          )}
        </div>
      </div>

      {(hasSuccess || hasError) && statusMessage && (
        <Alert variant={hasError ? 'destructive' : 'default'}>
          <AlertTitle className="font-headline">
            {hasError ? 'Message not sent' : 'Message sent'}
          </AlertTitle>
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      )}

      <div className="text-center">
        <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </div>
    </form>
  );
}