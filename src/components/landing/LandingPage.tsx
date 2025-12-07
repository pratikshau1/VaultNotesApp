import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Lock, Database, WifiOff, FileText, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b py-4 px-6 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">VaultNotes</span>
        </div>
        <div className="flex gap-4">
           <Link to="/auth">
            <Button>Open Vault</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 text-center max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent"
          >
            Your Private Digital Brain.<br />Encrypted. Offline. Yours.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            No cloud dependency. No tracking. AES-256 Client-Side Encryption. 
            Total ownership of your notes and files.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link to="/auth">
              <Button size="lg" className="h-12 px-8 text-lg">Create Secure Vault</Button>
            </Link>
            <Button variant="outline" size="lg" className="h-12 px-8 text-lg">How It Works</Button>
          </motion.div>
        </section>

        {/* Trust Visualization */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
              <div className="flex-1 p-6 bg-background rounded-2xl border shadow-sm">
                <div className="mb-4 text-primary"><FileText size={32} /></div>
                <h3 className="font-semibold mb-2">You Write</h3>
                <p className="text-sm text-muted-foreground">Plaintext exists only in your browser memory while you edit.</p>
              </div>
              <div className="hidden md:block text-muted-foreground">→</div>
              <div className="flex-1 p-6 bg-background rounded-2xl border shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                <div className="mb-4 text-primary"><Lock size={32} /></div>
                <h3 className="font-semibold mb-2">AES-256 Encrypt</h3>
                <p className="text-sm text-muted-foreground">Data is encrypted with your key before leaving the memory.</p>
              </div>
              <div className="hidden md:block text-muted-foreground">→</div>
              <div className="flex-1 p-6 bg-background rounded-2xl border shadow-sm">
                <div className="mb-4 text-primary"><Database size={32} /></div>
                <h3 className="font-semibold mb-2">Stored Locally</h3>
                <p className="text-sm text-muted-foreground">Encrypted blobs are saved to IndexedDB. No cloud involved.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Zero-Knowledge Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]">
            
            <Card className="md:col-span-2 row-span-2 p-8 flex flex-col justify-between bg-gradient-to-br from-background to-muted/20 overflow-hidden relative group">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">Encrypted Notes</h3>
                <p className="text-muted-foreground">Rich text editor with full encryption support. What you write stays yours.</p>
              </div>
              <div className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-primary/5 rounded-tl-3xl transition-transform group-hover:scale-105" />
              <FileText className="absolute bottom-8 right-8 w-24 h-24 text-primary/20" />
            </Card>

            <Card className="p-6 flex flex-col justify-center items-center text-center hover:bg-muted/50 transition-colors">
              <WifiOff className="w-10 h-10 mb-4 text-primary" />
              <h3 className="font-bold mb-1">Offline First</h3>
              <p className="text-sm text-muted-foreground">Works without internet.</p>
            </Card>

            <Card className="p-6 flex flex-col justify-center items-center text-center hover:bg-muted/50 transition-colors">
              <ShieldCheck className="w-10 h-10 mb-4 text-primary" />
              <h3 className="font-bold mb-1">Zero Knowledge</h3>
              <p className="text-sm text-muted-foreground">We can't read your data.</p>
            </Card>

            <Card className="md:col-span-3 p-8 flex items-center justify-between bg-primary text-primary-foreground">
              <div>
                <h3 className="text-2xl font-bold mb-2">Start your secure journey</h3>
                <p className="text-primary-foreground/80">Create your local vault in seconds.</p>
              </div>
              <Link to="/auth">
                <Button variant="secondary" size="lg">Get Started</Button>
              </Link>
            </Card>

          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        <p>© 2025 VaultNotes. Secure. Private. Open.</p>
      </footer>
    </div>
  );
}
