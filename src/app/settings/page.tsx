import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const ColorSwatch = ({ name, hex, className }: { name: string, hex: string, className: string }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`h-8 w-8 rounded-md border ${className}`}></div>
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted-foreground">{hex}</div>
      </div>
    </div>
  </div>
);

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tighter">
          Settings
        </h1>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Custom Domain</CardTitle>
            <CardDescription>
              Connect a custom domain to your portfolio for a professional
              online presence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full max-w-md items-center space-x-2">
              <Input type="text" placeholder="your-domain.com" />
              <Button type="submit">Connect</Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              After connecting, you will need to update your DNS records.
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Theme</CardTitle>
            <CardDescription>
              This is your current color palette. Full theme customization is
              coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <ColorSwatch name="Primary" hex="#3F51B5" className="bg-primary" />
             <Separator />
             <ColorSwatch name="Background" hex="#F0F2F5" className="bg-background" />
             <Separator />
             <ColorSwatch name="Accent" hex="#009688" className="bg-accent" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
