
import React from "react";
import { Button } from "@/components/ui/button";

export const HelpSection = () => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Часто задаваемые вопросы</h3>
        
        <div className="space-y-4">
          <div className="p-3 rounded-md bg-blue-50">
            <h4 className="font-medium">Как найти репетитора?</h4>
            <p className="text-sm text-gray-600 mt-1">
              Для поиска репетитора перейдите в раздел "Найти репетитора" и используйте фильтры для уточнения поиска. 
              Вы можете фильтровать по предмету, цене, рейтингу и другим параметрам.
            </p>
          </div>
          
          <div className="p-3 rounded-md bg-blue-50">
            <h4 className="font-medium">Как записаться на занятие?</h4>
            <p className="text-sm text-gray-600 mt-1">
              Выберите репетитора, перейдите в его профиль и нажмите кнопку "Записаться на занятие". 
              Затем выберите удобное время в расписании репетитора и отправьте запрос.
            </p>
          </div>
          
          <div className="p-3 rounded-md bg-blue-50">
            <h4 className="font-medium">Как оплатить занятие?</h4>
            <p className="text-sm text-gray-600 mt-1">
              После подтверждения занятия репетитором, вы получите уведомление с инструкцией по оплате. 
              Оплату можно произвести банковской картой, электронными деньгами или другими способами, указанными в инструкции.
            </p>
          </div>
          
          <div className="p-3 rounded-md bg-blue-50">
            <h4 className="font-medium">Как отменить занятие?</h4>
            <p className="text-sm text-gray-600 mt-1">
              Для отмены занятия перейдите в раздел "Расписание", найдите нужное занятие и нажмите кнопку "Отменить". 
              Обратите внимание, что отмена за менее чем 24 часа до начала занятия может повлечь штрафные санкции.
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Связаться с поддержкой</h3>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Если у вас есть вопросы или проблемы, которые не решаются с помощью FAQ, 
            вы можете связаться с нашей службой поддержки одним из следующих способов:
          </p>
          
          <div className="flex flex-col gap-3">
            <Button variant="outline" className="justify-start">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z" />
              </svg>
              Написать на email: support@stud.rep
            </Button>
            <Button variant="outline" className="justify-start">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z" />
              </svg>
              Позвонить: +7 (800) 123-45-67
            </Button>
            <Button variant="outline" className="justify-start">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
              </svg>
              Открыть чат с поддержкой
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
