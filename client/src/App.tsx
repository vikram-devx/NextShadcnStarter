import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import Home from "./pages/home";
import Login from "./pages/login";
import AuthPage from "./pages/auth-page";
import Dashboard from "./pages/dashboard";
import Profile from "./pages/profile";
import Markets from "./pages/markets";
import MarketDetail from "./pages/market-detail";
import MarketCreate from "./pages/market-create";
import GameTypes from "./pages/game-types";
import UserManagement from "./pages/user-management";
import Transactions from "./pages/transactions";
import BettingHistory from "./pages/betting-history";
import { useAuth } from "./hooks/use-auth";
import { AuthProvider } from "./components/providers/auth-provider";
import { Loader2 } from "lucide-react";

function AuthenticatedRoute({ component: Component, adminOnly = false, subadminOrAdmin = false, ...rest }: 
  { component: React.ComponentType<any>, adminOnly?: boolean, subadminOrAdmin?: boolean, [key: string]: any }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  if (adminOnly && user.role !== 'admin') {
    navigate("/dashboard");
    return null;
  }

  if (subadminOrAdmin && user.role !== 'admin' && user.role !== 'subadmin') {
    navigate("/dashboard");
    return null;
  }

  return <Component {...rest} />;
}

function PublicRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) {
  return <Component {...rest} />;
}

function Router() {
  const { user, isLoading } = useAuth();
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
          {/* Public Routes */}
          <Route path="/" component={Home} />
          <Route path="/login">
            {user ? <Dashboard /> : <AuthPage />}
          </Route>
          <Route path="/auth">
            {user ? <Dashboard /> : <AuthPage />}
          </Route>

          {/* Protected Routes */}
          <Route path="/dashboard">
            <AuthenticatedRoute component={Dashboard} />
          </Route>
          <Route path="/profile">
            <AuthenticatedRoute component={Profile} />
          </Route>
          <Route path="/markets">
            <AuthenticatedRoute component={Markets} />
          </Route>
          <Route path="/markets/create">
            <AuthenticatedRoute component={MarketCreate} adminOnly={true} />
          </Route>
          <Route path="/markets/:id">
            {(params) => <AuthenticatedRoute component={MarketDetail} id={params.id} />}
          </Route>
          <Route path="/game-types">
            <AuthenticatedRoute component={GameTypes} adminOnly={true} />
          </Route>
          <Route path="/users">
            <AuthenticatedRoute component={UserManagement} subadminOrAdmin={true} />
          </Route>
          <Route path="/transactions">
            <AuthenticatedRoute component={Transactions} />
          </Route>
          <Route path="/betting-history">
            <AuthenticatedRoute component={BettingHistory} />
          </Route>
          
          {/* 404 Route */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
