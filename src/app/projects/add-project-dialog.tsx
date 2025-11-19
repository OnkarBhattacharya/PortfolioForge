
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
import { useFirestore, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection } from 'firebase/firestore';
import { Loader2, Wand2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent } from '@/components/ui/card';
import { logger } from '@/lib/logger';

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const firestore = useFirestore();
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
    const newItemId = uuidv4();

    addDocumentNonBlocking(itemsCol, {
        id: newItemId,
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
  
  async function getSuggestions() {
    const description = form.getValues("description");
    if (!description) {
      toast({ title: "Add a description first!", description: "The AI needs something to work with." });
      return;
    }

    setIsSuggesting(true);
    try {
      const response = await fetch('/api/content-suggester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: description, contentType: 'project description' }),
      });

      if (!response.ok) {
        throw new Error('Failed to get suggestions.');
      }

      const { suggestions } = await response.json();
      setSuggestions(suggestions);
      setShowSuggestions(true);

    } catch (error) {
      logger.error('Error getting suggestions:', { error });
      toast({ variant: 'destructive', title: 'Error', description: 'Could not get suggestions. Please try again.' });
    } finally {
      setIsSuggesting(false);
    }
  }

  function applySuggestion(suggestion: string) {
    form.setValue('description', suggestion);
    setShowSuggestions(false);
    toast({ title: "Suggestion applied!" });
  }


  return (
    <>
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
                      <div className="relative">
                        <Textarea placeholder="A brief description of your work..." {...field} />
                        <Button type="button" size="icon" variant="ghost" className="absolute bottom-1 right-1 h-7 w-7" onClick={getSuggestions} disabled={isSuggesting}>
                          {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        </Button>
                      </div>
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
      <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline">AI Content Suggestions</DialogTitle>
            <DialogDescription>
              Here are some AI-powered suggestions to improve your project description. Click one to use it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[60vh] gap-4 overflow-y-auto p-2">
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => applySuggestion(suggestion)}>
                <CardContent className="p-4">
                  <p>{suggestion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
