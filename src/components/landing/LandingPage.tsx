import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Lock, Database, WifiOff, FileText, ArrowRight, Zap, Globe, Mail, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Navigation */}
      <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Lock className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">VaultNotes</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#security" className="hover:text-primary transition-colors">Security</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </nav>
          <div className="flex gap-4">
             <Link to="/auth">
              <Button>Open Vault</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
          <div className="container mx-auto px-6 text-center max-w-5xl">
            <motion.div
              initial="hidden"
              animate="show"
              variants={container}
            >
              <motion.div variants={item} className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium text-muted-foreground mb-6 bg-background/50 backdrop-blur">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                v3.0 Now Available with File Vault
              </motion.div>
              
              <motion.h1 variants={item} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                Your Digital Brain.<br />
                <span className="text-primary">Encrypted & Yours.</span>
              </motion.h1>
              
              <motion.p variants={item} className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                A local-first workspace for your notes and files. 
                AES-256 encryption ensures that what you write stays private. 
                No tracking, no cloud dependencies, just you and your thoughts.
              </motion.p>
              
              <motion.div variants={item} className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/auth">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all">
                    Create Secure Vault <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full bg-background/50 backdrop-blur">
                  View Source Code
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="py-12 px-6">
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="container mx-auto max-w-6xl"
            >
                <div className="rounded-xl border shadow-2xl overflow-hidden bg-card">
                    <div className="h-8 bg-muted border-b flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                    </div>
                    <div className="aspect-[16/9] bg-muted/20 flex items-center justify-center text-muted-foreground">
                        {/* Abstract UI Representation */}
                        <div className="w-full h-full grid grid-cols-[250px_1fr] divide-x">
                            <div className="p-4 space-y-4 bg-background/50">
                                <div className="h-8 w-3/4 bg-muted rounded animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-full bg-muted/50 rounded"></div>
                                    <div className="h-4 w-5/6 bg-muted/50 rounded"></div>
                                    <div className="h-4 w-4/6 bg-muted/50 rounded"></div>
                                </div>
                            </div>
                            <div className="p-8 space-y-6 bg-background">
                                <div className="h-10 w-1/3 bg-muted rounded animate-pulse"></div>
                                <div className="space-y-3">
                                    <div className="h-4 w-full bg-muted/30 rounded"></div>
                                    <div className="h-4 w-full bg-muted/30 rounded"></div>
                                    <div className="h-4 w-2/3 bg-muted/30 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Everything you need, nothing you don't</h2>
                <p className="text-muted-foreground">Built for focus, security, and speed.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-background border-none shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-8">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Client-Side Encryption</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Your data is encrypted with AES-256 before it ever leaves your keyboard. We cannot read your notes.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-background border-none shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-8">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                            <WifiOff className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">100% Offline Capable</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            VaultNotes runs entirely in your browser using IndexedDB. No internet connection required.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-background border-none shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-8">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Zero latency. Instant search. No loading spinners. Experience the speed of local software.
                        </p>
                    </CardContent>
                </Card>
                
                <Card className="bg-background border-none shadow-lg hover:shadow-xl transition-all duration-300 md:col-span-2">
                    <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                                <Database className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">File Vault</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Securely store images, documents, and files alongside your notes. All encrypted with the same zero-knowledge architecture.
                            </p>
                        </div>
                        <div className="flex-1 bg-muted/50 rounded-lg p-4 w-full">
                            <div className="flex items-center gap-3 mb-3 p-2 bg-background rounded border shadow-sm">
                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600"><FileText size={16} /></div>
                                <div className="text-xs">
                                    <div className="font-medium">Project_Specs.pdf</div>
                                    <div className="text-muted-foreground">2.4 MB • Encrypted</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-background rounded border shadow-sm">
                                <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center text-purple-600"><FileText size={16} /></div>
                                <div className="text-xs">
                                    <div className="font-medium">Design_Assets.zip</div>
                                    <div className="text-muted-foreground">15 MB • Encrypted</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-primary text-primary-foreground border-none shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-8 flex flex-col justify-center h-full">
                        <h3 className="text-2xl font-bold mb-4">Ready to secure your data?</h3>
                        <Link to="/auth">
                            <Button variant="secondary" className="w-full">Get Started Now</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24">
            <div className="container mx-auto px-6 max-w-4xl text-center">
                <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <a href="#" className="flex flex-col items-center p-6 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Mail className="w-5 h-5" />
                        </div>
                        <h3 className="font-medium">Email Support</h3>
                        <p className="text-sm text-muted-foreground mt-1">help@vaultnotes.app</p>
                    </a>
                    <a href="#" className="flex flex-col items-center p-6 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Github className="w-5 h-5" />
                        </div>
                        <h3 className="font-medium">GitHub</h3>
                        <p className="text-sm text-muted-foreground mt-1">Open Source</p>
                    </a>
                    <a href="#" className="flex flex-col items-center p-6 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Globe className="w-5 h-5" />
                        </div>
                        <h3 className="font-medium">Twitter</h3>
                        <p className="text-sm text-muted-foreground mt-1">@vaultnotes</p>
                    </a>
                </div>
            </div>
        </section>

      </main>

      <footer className="py-8 bg-muted/20 border-t">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="font-bold text-sm">VaultNotes</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 VaultNotes. Secure. Private. Open.</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground">Privacy</a>
                <a href="#" className="hover:text-foreground">Terms</a>
            </div>
        </div>
      </footer>
    </div>
  );
}
