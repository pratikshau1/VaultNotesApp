import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, Lock, Database, WifiOff, FileText, ArrowRight, 
  Zap, Globe, Mail, Github, LayoutGrid, Smartphone, Layers
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      {/* Navigation */}
      <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-xl z-50">
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
              <Button className="rounded-full px-6">Open Vault</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-70"></div>
          <div className="container mx-auto px-6 text-center max-w-5xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn} className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium text-muted-foreground mb-8 bg-background/50 backdrop-blur shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                v3.0 - Zero Knowledge Architecture
              </motion.div>
              
              <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 leading-[1.1]">
                Your Private Brain.<br />
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">Encrypted & Offline.</span>
              </motion.h1>
              
              <motion.p variants={fadeIn} className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                A local-first workspace for your notes and files. 
                AES-256 encryption ensures that what you write stays private. 
                No tracking, no cloud dependencies, just you.
              </motion.p>
              
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/auth">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105">
                    Create Secure Vault <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full bg-background/50 backdrop-blur hover:bg-muted">
                  How it Works
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* UI Showcase */}
        <section className="py-12 px-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="container mx-auto max-w-6xl"
            >
                <div className="rounded-xl border shadow-2xl overflow-hidden bg-card ring-1 ring-border/50">
                    <div className="h-10 bg-muted/50 border-b flex items-center px-4 gap-2">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                        </div>
                        <div className="mx-auto text-xs font-medium text-muted-foreground/50">VaultNotes - Dashboard</div>
                    </div>
                    <div className="aspect-[16/9] bg-background relative overflow-hidden group">
                        {/* Abstract UI Representation */}
                        <div className="absolute inset-0 grid grid-cols-[280px_1fr] divide-x">
                            <div className="p-6 space-y-6 bg-muted/10">
                                <div className="space-y-3">
                                    <div className="h-8 w-full bg-primary/10 rounded-lg animate-pulse"></div>
                                    <div className="h-8 w-full bg-muted/50 rounded-lg"></div>
                                    <div className="h-8 w-full bg-muted/50 rounded-lg"></div>
                                </div>
                                <div className="space-y-3 pt-4">
                                    <div className="h-4 w-12 bg-muted rounded"></div>
                                    <div className="h-6 w-3/4 bg-muted/30 rounded"></div>
                                    <div className="h-6 w-2/3 bg-muted/30 rounded"></div>
                                </div>
                            </div>
                            <div className="p-10 space-y-8 bg-background">
                                <div className="h-12 w-1/2 bg-muted rounded-lg animate-pulse delay-100"></div>
                                <div className="space-y-4">
                                    <div className="h-4 w-full bg-muted/40 rounded"></div>
                                    <div className="h-4 w-full bg-muted/40 rounded"></div>
                                    <div className="h-4 w-5/6 bg-muted/40 rounded"></div>
                                    <div className="h-4 w-4/6 bg-muted/40 rounded"></div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-20"></div>
                    </div>
                </div>
            </motion.div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Swiss Design. Fort Knox Security.</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    We combined the aesthetic of Swiss minimalism with military-grade encryption.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="md:col-span-2 bg-card rounded-2xl p-8 border shadow-sm hover:shadow-md transition-all"
                >
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-1">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                                <Database className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Encrypted File Vault</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Not just for text. Securely store images, PDFs, and documents. 
                                Everything is encrypted client-side before being stored in IndexedDB.
                            </p>
                        </div>
                        <div className="flex-1 w-full bg-muted/30 rounded-xl p-4 border border-dashed border-muted-foreground/20">
                            <div className="flex items-center gap-3 mb-3 p-3 bg-background rounded-lg border shadow-sm">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><FileText size={20} /></div>
                                <div>
                                    <div className="font-medium text-sm">Secret_Project.pdf</div>
                                    <div className="text-xs text-muted-foreground">Encrypted • 2.4 MB</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-background rounded-lg border shadow-sm opacity-60">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600"><FileText size={20} /></div>
                                <div>
                                    <div className="font-medium text-sm">Keys.txt</div>
                                    <div className="text-xs text-muted-foreground">Encrypted • 12 KB</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Feature 2 */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-card rounded-2xl p-8 border shadow-sm hover:shadow-md transition-all"
                >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                        <WifiOff className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">100% Offline</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        No internet? No problem. VaultNotes runs entirely in your browser. Your data never leaves your device.
                    </p>
                </motion.div>

                {/* Feature 3 */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-card rounded-2xl p-8 border shadow-sm hover:shadow-md transition-all"
                >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                        <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Instant Search</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        Find any note or file instantly. Local processing means zero latency.
                    </p>
                </motion.div>

                {/* Feature 4 */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="md:col-span-2 bg-card rounded-2xl p-8 border shadow-sm hover:shadow-md transition-all"
                >
                     <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1 order-2 md:order-1">
                             <div className="grid grid-cols-2 gap-3">
                                <div className="bg-background p-4 rounded-lg border shadow-sm">
                                    <LayoutGrid className="w-6 h-6 mb-2 text-primary" />
                                    <div className="font-medium text-sm">Folders</div>
                                </div>
                                <div className="bg-background p-4 rounded-lg border shadow-sm">
                                    <Layers className="w-6 h-6 mb-2 text-primary" />
                                    <div className="font-medium text-sm">Labels</div>
                                </div>
                                <div className="bg-background p-4 rounded-lg border shadow-sm">
                                    <Smartphone className="w-6 h-6 mb-2 text-primary" />
                                    <div className="font-medium text-sm">Responsive</div>
                                </div>
                                <div className="bg-background p-4 rounded-lg border shadow-sm">
                                    <ShieldCheck className="w-6 h-6 mb-2 text-primary" />
                                    <div className="font-medium text-sm">AES-256</div>
                                </div>
                             </div>
                        </div>
                        <div className="flex-1 order-1 md:order-2">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                                <LayoutGrid className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Organized Chaos</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Use nested folders, smart labels, and pinning to keep your digital life structured. 
                                The interface adapts to your workflow, not the other way around.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-24 bg-background">
            <div className="container mx-auto px-6 max-w-4xl text-center">
                <div className="inline-block p-3 rounded-full bg-green-100 text-green-700 mb-6">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Zero-Knowledge Architecture</h2>
                <p className="text-xl text-muted-foreground mb-12">
                    We don't store your password. We don't have your keys. We can't see your data.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    <div className="space-y-2">
                        <div className="font-bold text-lg flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
                            PBKDF2 Hashing
                        </div>
                        <p className="text-sm text-muted-foreground">Your password is salted and hashed 10,000 times to derive your encryption key locally.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="font-bold text-lg flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</span>
                            AES-256 Encryption
                        </div>
                        <p className="text-sm text-muted-foreground">Every note and file is encrypted with a unique IV before being saved to IndexedDB.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="font-bold text-lg flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">3</span>
                            Local Storage
                        </div>
                        <p className="text-sm text-muted-foreground">Data lives in your browser. Clearing your browser data wipes the vault securely.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-muted/30 border-t">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
                    <p className="text-muted-foreground">
                        Have questions about security or features? We're here to help.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <a href="mailto:support@vaultnotes.app" className="flex flex-col items-center p-8 bg-card rounded-2xl border hover:border-primary/50 transition-colors group">
                        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold mb-1">Email Support</h3>
                        <p className="text-sm text-muted-foreground">support@vaultnotes.app</p>
                    </a>
                    <a href="https://github.com/vaultnotes" target="_blank" rel="noreferrer" className="flex flex-col items-center p-8 bg-card rounded-2xl border hover:border-primary/50 transition-colors group">
                        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Github className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold mb-1">GitHub</h3>
                        <p className="text-sm text-muted-foreground">Check the code</p>
                    </a>
                    <a href="https://twitter.com/vaultnotes" target="_blank" rel="noreferrer" className="flex flex-col items-center p-8 bg-card rounded-2xl border hover:border-primary/50 transition-colors group">
                        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold mb-1">Twitter</h3>
                        <p className="text-sm text-muted-foreground">@vaultnotes</p>
                    </a>
                </div>
            </div>
        </section>

      </main>

      <footer className="py-12 bg-background border-t">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <Lock className="w-3 h-3 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">VaultNotes</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 VaultNotes. Secure. Private. Open.</p>
            <div className="flex gap-6 text-sm text-muted-foreground font-medium">
                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms</a>
                <a href="#" className="hover:text-primary transition-colors">Sitemap</a>
            </div>
        </div>
      </footer>
    </div>
  );
}
