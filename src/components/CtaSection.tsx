
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const CtaSection = () => {
  return (
    <div className="py-16 md:py-24 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Готовы начать учиться или преподавать?
        </h2>
        <p className="text-xl text-white/80 max-w-3xl mx-auto mb-10">
          Присоединяйтесь к нашему сообществу студентов и репетиторов уже сегодня и откройте новые возможности для образования
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
            <Link to="/register">Зарегистрироваться</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
            <Link to="/">Узнать больше</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
