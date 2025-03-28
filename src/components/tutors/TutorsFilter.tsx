
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { CheckIcon, XIcon } from "lucide-react";

type Subject = {
  id: string;
  name: string;
};

export function TutorsFilter() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [priceRange, setPriceRange] = useState([500, 3000]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Get current filter values from URL
  const currentSubject = searchParams.get("subject") || "";
  const currentMinPrice = searchParams.get("min_price") || "";
  const currentMaxPrice = searchParams.get("max_price") || "";

  // Fetch subjects from database
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from("subjects")
          .select("id, name")
          .eq("is_active", true)
          .order("name");

        if (error) {
          throw error;
        }

        if (data) {
          setSubjects(data);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  // Initialize price range from URL params
  useEffect(() => {
    const minPrice = currentMinPrice ? parseInt(currentMinPrice) : 500;
    const maxPrice = currentMaxPrice ? parseInt(currentMaxPrice) : 3000;
    setPriceRange([minPrice, maxPrice]);
  }, [currentMinPrice, currentMaxPrice]);

  const handleSubjectClick = (subject: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (params.get("subject") === subject) {
      params.delete("subject");
    } else {
      params.set("subject", subject);
    }
    
    setSearchParams(params);
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
  };

  const applyFilters = () => {
    setLoading(true);
    const params = new URLSearchParams(searchParams);
    
    params.set("min_price", priceRange[0].toString());
    params.set("max_price", priceRange[1].toString());
    
    setSearchParams(params);
    setLoading(false);
  };

  const resetFilters = () => {
    setLoading(true);
    setPriceRange([500, 3000]);
    setSearchParams({});
    setLoading(false);
  };

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Фильтры</h2>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Предметы</h3>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <Button
              key={subject.id}
              size="sm"
              variant={currentSubject === subject.name ? "default" : "outline"}
              onClick={() => handleSubjectClick(subject.name)}
            >
              {subject.name}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <Label className="text-sm font-medium">Цена (₽/час)</Label>
          <span className="text-sm text-gray-500">
            {priceRange[0]} - {priceRange[1]} ₽
          </span>
        </div>
        
        <Slider
          defaultValue={[500, 3000]}
          value={priceRange}
          min={0}
          max={5000}
          step={100}
          onValueChange={handlePriceChange}
          className="my-4"
        />
        
        <div className="flex justify-between text-sm text-gray-500">
          <span>0 ₽</span>
          <span>5,000 ₽</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={applyFilters}
          className="flex-1"
          disabled={loading}
        >
          <CheckIcon className="h-4 w-4 mr-1" />
          Применить
        </Button>
        
        <Button
          variant="outline"
          onClick={resetFilters}
          disabled={loading}
        >
          <XIcon className="h-4 w-4 mr-1" />
          Сбросить
        </Button>
      </div>
    </Card>
  );
}
