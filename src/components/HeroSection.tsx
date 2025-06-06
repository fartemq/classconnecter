
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
        
        <div className="bg-gradient-to-r from-[#3498db] to-[#2980b9] text-white py-8 px-6 rounded-xl shadow-lg max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            🎓 Начните свой путь к знаниям уже сегодня!
          </h2>
          <p className="text-lg opacity-95">
            Зарегистрируйтесь на платформе и откройте мир качественного образования
          </p>
        </div>
      </div>
    </div>
  );
};
