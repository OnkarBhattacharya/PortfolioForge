
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
  technologies: z.string().optional(),
  projectUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddProjectDialog({ children }: { children: React.ReactNode }) {
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
      technologies: '',
      projectUrl: '',
    },
  });
  
  const handleTriggerClick = () => {
    if (isReadOnly) {
       toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in or sign up to add a project.",
      });
    } else {
        setOpen(true);
    }
  };

  async function onSubmit(values: FormValues) {
    if (!firestore || !user || user.isAnonymous) return;

    setIsSubmitting(true);
    const projectsCol = collection(firestore, 'users', user.uid, 'projects');
    const technologiesArray =
      values.technologies?.split(',').map((t) => t.trim()).filter(Boolean) || [];
    
    const imageId = `project-${Math.floor(Math.random() * 5) + 1}`;

    addDocumentNonBlocking(projectsCol, {
        name: values.name,
        description: values.description,
        projectUrl: values.projectUrl,
        technologies: technologiesArray,
        userProfileId: user.uid,
        imageId,
        source: 'firebase',
    });

    toast({
        title: 'Project Added!',
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
          <DialogTitle className="font-headline">Add a New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new project to your portfolio.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome App" {...field} />
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
                    <Textarea placeholder="A brief description of your project..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="technologies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technologies</FormLabel>
                  <FormControl>
                    <Input placeholder="React, Next.js, Firebase" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a comma-separated list of technologies.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="projectUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/user/repo" {...field} />
                  </FormControl>
                   <FormDescription>
                    Link to the live demo or source code repository.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
