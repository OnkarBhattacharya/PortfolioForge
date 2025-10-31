
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

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  userId: string;
}

export function ContactForm({ userId }: ContactFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong.');
      }

      toast({
        title: 'Message Sent!',
        description: 'Thank you for getting in touch. I will get back to you shortly.',
      });
      form.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not send message. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="name" className="sr-only">Your Name</label>
          <Input id="name" placeholder="Your Name" {...form.register('name')} className="bg-background" />
          {form.formState.errors.name && (
            <p className="mt-2 text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="sr-only">Your Email</label>
          <Input id="email" type="email" placeholder="Your Email" {...form.register('email')} className="bg-background" />
          {form.formState.errors.email && (
            <p className="mt-2 text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="message" className="sr-only">Your Message</label>
          <Textarea id="message" placeholder="Your Message" {...form.register('message')} rows={6} className="bg-background" />
          {form.formState.errors.message && (
            <p className="mt-2 text-sm text-destructive">{form.formState.errors.message.message}</p>
          )}
        </div>
      </div>
      <div className="text-center">
        <Button type="submit" disabled={isLoading} size="lg" className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Message
        </Button>
      </div>
    </form>
  );
}
