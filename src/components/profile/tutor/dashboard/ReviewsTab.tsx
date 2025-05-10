
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface ReviewsTabProps {
  tutorId: string;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({ tutorId }) => {
  // В реальном приложении здесь был бы хук для загрузки отзывов
  const reviews: any[] = [];
  
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <EmptyState
            title="Отзывы отсутствуют"
            description="Когда ученики оставят отзывы о ваших занятиях, они появятся здесь."
            action={
              <Button variant="outline">
                Пригласить учеников
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="py-6">
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{review.studentName}</h4>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating 
                            ? "text-amber-400 fill-amber-400" 
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm ml-2 text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mt-2">{review.comment}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
