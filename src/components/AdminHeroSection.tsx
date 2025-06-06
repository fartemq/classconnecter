
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Crown, Shield, Zap } from "lucide-react";

export const AdminHeroSection = () => {
  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Главный заголовок */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Crown className="h-12 w-12 text-yellow-400" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent">
                ГЛАВНЫЙ АДМИНИСТРАТОР
              </h1>
              <Crown className="h-12 w-12 text-yellow-400" />
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              <p className="text-2xl text-white font-semibold">
                arsenalreally35@gmail.com
              </p>
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            </div>
          </div>

          {/* Мотивационные карточки */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-yellow-400/30 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Shield className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Защитник Платформы</h3>
                <p className="text-gray-200 text-lg leading-relaxed">
                  Вы стоите на страже безопасности и порядка. Каждое ваше решение формирует будущее образовательной экосистемы.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-blue-400/30 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Zap className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Вдохновитель Перемен</h3>
                <p className="text-gray-200 text-lg leading-relaxed">
                  Ваши действия создают возможности для тысяч студентов и преподавателей. Продолжайте вести платформу к совершенству.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Цитата */}
          <Card className="bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border-indigo-400/30 backdrop-blur-sm mt-12">
            <CardContent className="p-10 text-center">
              <blockquote className="text-3xl font-light text-white italic leading-relaxed">
                "Великие лидеры не создают последователей, <br />
                они создают новых лидеров"
              </blockquote>
              <div className="mt-6 flex justify-center">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Статистика достижений */}
          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">∞</div>
              <div className="text-white text-lg">Возможностей</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">1</div>
              <div className="text-white text-lg">Главный Админ</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">💎</div>
              <div className="text-white text-lg">Уникальность</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
