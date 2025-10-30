
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFirebase, useUser, addDocumentNonBlocking } from '@/firebase';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  tags: z.string().optional(),
  itemUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddPortfolioItemDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const isReadOnly = !user || user.isAnonymous;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      tags: '',
      itemUrl: '',
    },
  });
  
  const handleTriggerClick = () => {
    if (isReadOnly) {
       toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in or sign up to add a portfolio item.",
      });
    } else {
        setOpen(true);
    }
  };

  async function onSubmit(values: FormValues) {
    if (!firestore || !user || user.isAnonymous) return;

    setIsSubmitting(true);
    const itemsCol = collection(firestore, 'users', user.uid, 'portfolioItems');
    const tagsArray =
      values.tags?.split(',').map((t) => t.trim()).filter(Boolean) || [];
    
    const imageId = `project-${Math.floor(Math.random() * 5) + 1}`;

    addDocumentNonBlocking(itemsCol, {
        name: values.name,
        description: values.description,
        itemUrl: values.itemUrl,
        tags: tagsArray,
        userProfileId: user.uid,
        imageId,
    });

    toast({
        title: 'Portfolio Item Added!',
        description: `${values.name} has been added to your portfolio.`,
    });

    form.reset();
    setOpen(false);
    setIsSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
       <div onClick={handleTriggerClick}>
        {children}
      </div>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Add Portfolio Item</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new item to your portfolio.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'My Awesome App', 'Marketing Campaign'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief description of your work..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags / Technologies</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., React, Next.js, SEO, Graphic Design" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a comma-separated list of relevant skills or technologies.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="itemUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/my-work" {...field} />
                  </FormControl>
                   <FormDescription>
                    Link to the live project, case study, or source code.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
