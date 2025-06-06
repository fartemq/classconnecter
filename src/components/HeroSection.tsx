
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <div className="bg-accent py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
          Stud.rep: Ваши знания - наш приоритет!
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Найдите проверенных репетиторов по любому предмету по доступным ценам. 
          Получите персонализированное образование в удобном формате, который 
          соответствует вашему расписанию.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-[#3498db] hover:bg-[#2980b9] text-white w-full md:w-auto">
            <Link to="/subjects/mathematics/school">Я - школьник</Link>
          </Button>
          
          <Button asChild size="lg" className="bg-[#3498db] hover:bg-[#2980b9] text-white w-full md:w-auto">
            <Link to="/subjects/mathematics/adult">Я - студент/взрослый</Link>
          </Button>
          
          <Button asChild size="lg" className="bg-[#3498db] hover:bg-[#2980b9] text-white w-full md:w-auto">
            <Link to="/become-tutor">Я - репетитор</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
