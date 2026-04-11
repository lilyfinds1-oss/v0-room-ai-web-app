'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'

export default function ComponentsShowcase() {
  return (
    <div className="min-h-screen bg-background-dark text-text-primary p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-2 mb-12">
        <h1 className="text-5xl font-bold gradient-text">Design System Components</h1>
        <p className="text-text-secondary text-lg">A comprehensive showcase of RoomAI&apos;s premium component library</p>
      </div>

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Buttons Section */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Multiple variants, sizes, and states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Buttons */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-text-secondary">Primary Variant</p>
              <div className="flex flex-wrap gap-3">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
                <Button isLoading>Loading</Button>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-text-secondary">Secondary Variant</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="secondary" size="md">Secondary</Button>
                <Button variant="secondary" size="lg">Secondary</Button>
              </div>
            </div>

            {/* Outline Buttons */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-text-secondary">Outline Variant</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="outline" size="md">Outline</Button>
                <Button variant="outline" size="lg">Outline</Button>
              </div>
            </div>

            {/* Ghost & Danger */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-text-secondary">Ghost & Danger Variants</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost" size="md">Ghost</Button>
                <Button variant="danger" size="md">Delete</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inputs Section */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
            <CardDescription>Text inputs with labels and states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" placeholder="you@example.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" placeholder="••••••••" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disabled">Disabled Input</Label>
              <Input id="disabled" placeholder="This is disabled" disabled />
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Color variants for different states and purposes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Cards Section */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Card Layouts</CardTitle>
            <CardDescription>Various card compositions and states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sample Card</CardTitle>
                  <CardDescription>This is a card within a card</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary">Card content goes here with proper spacing and typography.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interactive Card</CardTitle>
                  <CardDescription>Hover to see elevation change</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Action
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Colors Section */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>Complete color system used throughout the design</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Primary', color: 'bg-primary' },
                { name: 'Secondary', color: 'bg-secondary' },
                { name: 'Success', color: 'bg-success' },
                { name: 'Warning', color: 'bg-warning' },
                { name: 'Error', color: 'bg-error' },
                { name: 'Info', color: 'bg-info' },
                { name: 'Surface', color: 'bg-surface' },
                { name: 'Background', color: 'bg-background-light' },
              ].map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className={`${item.color} h-24 rounded-lg shadow-elevation-2`} />
                  <p className="text-sm font-semibold text-text-primary text-center">{item.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Animation Examples */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Animations & Effects</CardTitle>
            <CardDescription>Smooth transitions and micro-interactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-primary rounded-lg animate-glow-pulse" />
                <p className="text-sm text-text-secondary">Glow Pulse</p>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-secondary rounded-lg animate-float" />
                <p className="text-sm text-text-secondary">Float</p>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <Spinner size="lg" color="primary" />
                <p className="text-sm text-text-secondary">Spinner</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography Section */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>Font sizes and weights used in the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-secondary mb-1">Display</p>
                <p className="text-display font-bold">The quick brown fox</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Heading 1</p>
                <p className="text-4xl font-bold">The quick brown fox</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Heading 2</p>
                <p className="text-2xl font-semibold">The quick brown fox</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Body</p>
                <p className="text-base">The quick brown fox jumps over the lazy dog. This is regular body text used for paragraphs and descriptions.</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Small</p>
                <p className="text-sm">The quick brown fox jumps over the lazy dog.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
