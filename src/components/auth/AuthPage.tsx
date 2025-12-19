import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Shield, Download, Key, AlertTriangle, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const { login, register, recoverAccount } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register" | "recover">("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [generatedRecoveryKey, setGeneratedRecoveryKey] = useState("");
  const [recoveredPassphrase, setRecoveredPassphrase] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);

  const downloadRecoveryKey = (key: string) => {
    const blob = new Blob([`VaultNotes Recovery Key\n\nUsername: ${username}\nRecovery Key: ${key}\n\nIMPORTANT: Store this key securely. You will need it to recover your vault if you forget your encryption passphrase.`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaultnotes-recovery-${username}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(username, password, passphrase);
    setIsLoading(false);
    if (success) navigate("/dashboard");
  };

  const handleRegisterStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return;
    }
    setRegistrationStep(2);
  };

  const handleRegisterStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase !== confirmPassphrase) {
      return;
    }

    setIsLoading(true);
    const result = await register(username, password, passphrase);
    setIsLoading(false);

    if (result.success && result.recoveryKey) {
      setGeneratedRecoveryKey(result.recoveryKey);
      setRegistrationStep(3);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await recoverAccount(username, recoveryKey);
    setIsLoading(false);

    if (result.success && result.passphrase) {
      setRecoveredPassphrase(result.passphrase);
    }
  };

  const completeRegistration = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] [mask-image:radial-gradient(white,transparent_85%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="border-2 shadow-2xl backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center pb-4 space-y-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Shield className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight">VaultNotes</CardTitle>
              <CardDescription className="mt-2 text-base">
                {activeTab === "login" && "Welcome back. Unlock your encrypted vault."}
                {activeTab === "register" && "Create your secure vault with zero-knowledge encryption."}
                {activeTab === "recover" && "Recover access using your recovery key."}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pb-6">
            <Tabs value={activeTab} onValueChange={(v) => {
              setActiveTab(v as any);
              setRegistrationStep(1);
              setGeneratedRecoveryKey("");
              setRecoveredPassphrase("");
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
                <TabsTrigger value="login" className="text-xs sm:text-sm">Login</TabsTrigger>
                <TabsTrigger value="register" className="text-xs sm:text-sm">Register</TabsTrigger>
                <TabsTrigger value="recover" className="text-xs sm:text-sm">Recover</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="login" className="mt-0">
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleLogin}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="login-user" className="text-sm font-medium">Username</Label>
                      <Input
                        id="login-user"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-pass" className="text-sm font-medium">Login Password</Label>
                      <div className="relative">
                        <Input
                          id="login-pass"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-11 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-passphrase" className="text-sm font-medium">Encryption Passphrase</Label>
                      <div className="relative">
                        <Input
                          id="login-passphrase"
                          type={showPassphrase ? "text" : "password"}
                          placeholder="Enter your encryption passphrase"
                          value={passphrase}
                          onChange={(e) => setPassphrase(e.target.value)}
                          required
                          className="h-11 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassphrase(!showPassphrase)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassphrase ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This decrypts your vault data
                      </p>
                    </div>

                    <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                      {isLoading ? "Unlocking..." : "Unlock Vault"}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Forgot your passphrase?{" "}
                      <button
                        type="button"
                        onClick={() => setActiveTab("recover")}
                        className="text-primary hover:underline font-medium"
                      >
                        Use Recovery Key
                      </button>
                    </p>
                  </motion.form>
                </TabsContent>

                <TabsContent value="register" className="mt-0">
                  <AnimatePresence mode="wait">
                    {registrationStep === 1 && (
                      <motion.form
                        key="register-step-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleRegisterStep1}
                        className="space-y-5"
                      >
                        <Alert className="border-yellow-500/50 bg-yellow-500/10">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-xs text-yellow-600 dark:text-yellow-500">
                            <strong>Important:</strong> Your login password and encryption passphrase are separate. Choose both carefully and store your recovery key securely.
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                          <Label htmlFor="reg-user" className="text-sm font-medium">Username</Label>
                          <Input
                            id="reg-user"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reg-pass" className="text-sm font-medium">Login Password</Label>
                          <Input
                            id="reg-pass"
                            type="password"
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="h-11"
                          />
                          <p className="text-xs text-muted-foreground">For authentication only (min. 8 characters)</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reg-confirm-pass" className="text-sm font-medium">Confirm Password</Label>
                          <Input
                            id="reg-confirm-pass"
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                            className="h-11"
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-11 text-base font-medium"
                          disabled={password !== confirmPassword || password.length < 8}
                        >
                          Continue to Encryption Setup
                        </Button>
                      </motion.form>
                    )}

                    {registrationStep === 2 && (
                      <motion.form
                        key="register-step-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleRegisterStep2}
                        className="space-y-5"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setRegistrationStep(1)}
                          className="mb-2"
                        >
                          <ArrowLeft size={16} className="mr-2" /> Back
                        </Button>

                        <Alert className="border-blue-500/50 bg-blue-500/10">
                          <Key className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-xs text-blue-600 dark:text-blue-400">
                            Your encryption passphrase encrypts all your vault data. Make it strong and memorable.
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                          <Label htmlFor="reg-passphrase" className="text-sm font-medium">Encryption Passphrase</Label>
                          <Input
                            id="reg-passphrase"
                            type="password"
                            placeholder="Create your encryption passphrase"
                            value={passphrase}
                            onChange={(e) => setPassphrase(e.target.value)}
                            required
                            minLength={12}
                            className="h-11"
                          />
                          <p className="text-xs text-muted-foreground">
                            This encrypts all your data (min. 12 characters)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reg-confirm-passphrase" className="text-sm font-medium">Confirm Passphrase</Label>
                          <Input
                            id="reg-confirm-passphrase"
                            type="password"
                            placeholder="Confirm your encryption passphrase"
                            value={confirmPassphrase}
                            onChange={(e) => setConfirmPassphrase(e.target.value)}
                            required
                            minLength={12}
                            className="h-11"
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-11 text-base font-medium"
                          disabled={isLoading || passphrase !== confirmPassphrase || passphrase.length < 12}
                        >
                          {isLoading ? "Creating Vault..." : "Create Secure Vault"}
                        </Button>
                      </motion.form>
                    )}

                    {registrationStep === 3 && generatedRecoveryKey && (
                      <motion.div
                        key="register-step-3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-5 text-center"
                      >
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>

                        <div>
                          <h3 className="text-xl font-bold mb-2">Vault Created Successfully</h3>
                          <p className="text-sm text-muted-foreground">
                            Download and securely store your recovery key
                          </p>
                        </div>

                        <Alert className="border-red-500/50 bg-red-500/10 text-left">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-xs text-red-600 dark:text-red-400">
                            <strong>Critical:</strong> Store this recovery key securely. Without it, you cannot recover your vault if you forget your encryption passphrase.
                          </AlertDescription>
                        </Alert>

                        <div className="bg-muted/50 p-4 rounded-lg border-2 border-dashed">
                          <p className="text-xs text-muted-foreground mb-2 font-medium">Your Recovery Key</p>
                          <code className="text-xs font-mono bg-background p-3 rounded block break-all">
                            {generatedRecoveryKey}
                          </code>
                        </div>

                        <Button
                          onClick={() => downloadRecoveryKey(generatedRecoveryKey)}
                          className="w-full h-11 text-base font-medium"
                          variant="outline"
                        >
                          <Download size={18} className="mr-2" />
                          Download Recovery Key
                        </Button>

                        <Button
                          onClick={completeRegistration}
                          className="w-full h-11 text-base font-medium"
                        >
                          Continue to Vault
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>

                <TabsContent value="recover" className="mt-0">
                  <motion.div
                    key="recover-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-5"
                  >
                    {!recoveredPassphrase ? (
                      <form onSubmit={handleRecovery} className="space-y-5">
                        <Alert>
                          <Key className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Enter your recovery key to retrieve your encryption passphrase.
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                          <Label htmlFor="recover-user" className="text-sm font-medium">Username</Label>
                          <Input
                            id="recover-user"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="recover-key" className="text-sm font-medium">Recovery Key</Label>
                          <Input
                            id="recover-key"
                            placeholder="Paste your recovery key"
                            value={recoveryKey}
                            onChange={(e) => setRecoveryKey(e.target.value)}
                            required
                            className="h-11 font-mono text-xs"
                          />
                        </div>

                        <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                          {isLoading ? "Recovering..." : "Recover Passphrase"}
                        </Button>
                      </form>
                    ) : (
                      <div className="space-y-5 text-center">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>

                        <div>
                          <h3 className="text-xl font-bold mb-2">Recovery Successful</h3>
                          <p className="text-sm text-muted-foreground">
                            Your encryption passphrase has been recovered
                          </p>
                        </div>

                        <div className="bg-muted/50 p-4 rounded-lg border-2 border-dashed text-left">
                          <p className="text-xs text-muted-foreground mb-2 font-medium">Your Encryption Passphrase</p>
                          <code className="text-sm font-mono bg-background p-3 rounded block break-all">
                            {recoveredPassphrase}
                          </code>
                        </div>

                        <Alert className="border-blue-500/50 bg-blue-500/10 text-left">
                          <AlertDescription className="text-xs text-blue-600 dark:text-blue-400">
                            Use this passphrase to login. Consider changing it after logging in.
                          </AlertDescription>
                        </Alert>

                        <Button
                          onClick={() => {
                            setPassphrase(recoveredPassphrase);
                            setActiveTab("login");
                          }}
                          className="w-full h-11 text-base font-medium"
                        >
                          Go to Login
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 text-center border-t pt-6">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>AES-256 Encryption • Zero-Knowledge Architecture</span>
            </div>
            <Link to="/" className="text-xs text-primary hover:underline font-medium">
              Back to Home
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
