import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { user, userRole } = useSimpleAuth();

  const getProfileLink = () => {
    if (!user) return "/";
    switch (userRole) {
      case "admin":
        return "/admin";
      case "tutor":
        return "/profile/tutor";
      case "student":
        return "/profile/student";
      default:
        return "/";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-primary mb-4">404</CardTitle>
          <CardTitle>Страница не найдена</CardTitle>
          <CardDescription>
            К сожалению, запрашиваемая страница не существует или была перемещена.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
            
            {user ? (
              <Link to={getProfileLink()} className="block">
                <Button className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  В профиль
                </Button>
              </Link>
            ) : (
              <Link to="/" className="block">
                <Button className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  На главную
                </Button>
              </Link>
            )}
            
            <Link to="/search" className="block">
              <Button variant="secondary" className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Найти репетитора
              </Button>
            </Link>
          </div>

          <div className="text-sm text-muted-foreground mt-6">
            Если вы считаете, что это ошибка, 
            <Link to="/about" className="text-primary hover:underline ml-1">
              свяжитесь с нами
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;