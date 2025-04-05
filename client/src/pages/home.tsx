import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { 
  Dices, 
  Coins, 
  Trophy, 
  Shield, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  ChevronRight 
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Badge variant="outline" className="mb-2">Premier Gaming Platform</Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl">
                  Welcome to Sata Matka
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Experience the thrill of traditional Matka games on our secure and transparent platform.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {user ? (
                  <Button asChild size="lg">
                    <Link href="/markets">
                      Play Now <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg">
                    <Link href="/login">
                      Get Started <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="lg" asChild>
                  <Link href="/markets">
                    View Markets <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-[400px] aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/30 rounded-3xl blur-3xl opacity-50 animate-pulse" />
                <div className="relative bg-muted p-6 sm:p-10 rounded-3xl border shadow-lg flex items-center justify-center">
                  <Dices className="h-32 w-32 text-primary/80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Why Choose Our Platform
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Sata Matka offers a secure, transparent, and enjoyable gaming experience with multiple game types.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-3 gap-6 py-12">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 bg-primary/10 rounded-full blur-2xl" />
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure Platform</CardTitle>
                <CardDescription>
                  Industry-leading security protocols to protect your data and transactions.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 bg-primary/10 rounded-full blur-2xl" />
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Multiple Game Types</CardTitle>
                <CardDescription>
                  Enjoy a variety of traditional Matka games, including Jodi, Hurf, Cross, and Odd-Even.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 bg-primary/10 rounded-full blur-2xl" />
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Instant Payouts</CardTitle>
                <CardDescription>
                  Winnings are automatically credited to your account as soon as results are declared.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                How It Works
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Getting started with Sata Matka is easy. Follow these simple steps to begin your gaming journey.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-4 gap-6 py-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-4">
                1
              </div>
              <h3 className="text-lg font-medium mb-2">Create Account</h3>
              <p className="text-sm text-muted-foreground">
                Sign up with your details to create your gaming account.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-4">
                2
              </div>
              <h3 className="text-lg font-medium mb-2">Deposit Funds</h3>
              <p className="text-sm text-muted-foreground">
                Add money to your wallet using our secure payment options.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-4">
                3
              </div>
              <h3 className="text-lg font-medium mb-2">Place Bets</h3>
              <p className="text-sm text-muted-foreground">
                Choose markets, select game types, and place your bets.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mb-4">
                4
              </div>
              <h3 className="text-lg font-medium mb-2">Win & Withdraw</h3>
              <p className="text-sm text-muted-foreground">
                Collect your winnings and withdraw them anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Game Types Section */}
      <section className="w-full py-12 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Our Game Types
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Explore the variety of traditional Matka games available on our platform.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dices className="h-5 w-5 text-primary" /> Jodi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bet on a pair of numbers. Win big if your chosen pair matches the result.
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Payout Multiplier:</span>
                    <Badge variant="outline">90x</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dices className="h-5 w-5 text-primary" /> Hurf
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bet on a single digit. Win if your digit appears in the result.
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Payout Multiplier:</span>
                    <Badge variant="outline">9x</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dices className="h-5 w-5 text-primary" /> Cross
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bet on numbers appearing in a specific pattern. Higher risk, higher rewards.
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Payout Multiplier:</span>
                    <Badge variant="outline">12x</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dices className="h-5 w-5 text-primary" /> Odd-Even
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bet on whether the result will be an odd or even number. Simple and popular.
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Payout Multiplier:</span>
                    <Badge variant="outline">2x</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Start Playing?
              </h2>
              <p className="max-w-[600px] md:text-xl/relaxed mx-auto">
                Join thousands of players already enjoying Sata Matka games. Create your account now.
              </p>
            </div>
            <div className="space-x-4">
              {user ? (
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/markets">
                    Browse Markets <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/login">
                    Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
