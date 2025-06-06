
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Crown, Shield, Zap } from "lucide-react";

export const AdminMotivationalPage = () => {
  return (
    <div className="max-w-4xl mx-auto text-center space-y-8">
      {/* Главный заголовок */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Crown className="h-8 w-8 text-yellow-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-amber-500 bg-clip-text text-transparent">
            ДОБРО ПОЖАЛОВАТЬ, ГЛАВНЫЙ АДМИНИСТРАТОР
          </h1>
          <Crown className="h-8 w-8 text-yellow-600" />
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
          <p className="text-xl text-gray-700 font-semibold">
            arsenalreally35@gmail.com
          </p>
          <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
        </div>
      </div>

      {/* Мотивационные карточки */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-3">Защитник Платформы</h3>
            <p className="text-gray-600 leading-relaxed">
              Вы стоите на страже безопасности и порядка. Каждое ваше решение формирует будущее образовательной экосистемы.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-purple-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-3">Вдохновитель Перемен</h3>
            <p className="text-gray-600 leading-relaxed">
              Ваши действия создают возможности для тысяч студентов и преподавателей. Продолжайте вести платформу к совершенству.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Цитата */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-100 border-indigo-200 mt-8">
        <CardContent className="p-8 text-center">
          <blockquote className="text-2xl font-light text-gray-700 italic leading-relaxed">
            "Великие лидеры не создают последователей, <br />
            они создают новых лидеров"
          </blockquote>
          <div className="mt-4 flex justify-center">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-600 fill-yellow-600" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика достижений */}
      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">∞</div>
          <div className="text-gray-600 text-sm">Возможностей</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
          <div className="text-gray-600 text-sm">Главный Админ</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">💎</div>
          <div className="text-gray-600 text-sm">Уникальность</div>
        </div>
      </div>
    </div>
  );
};
