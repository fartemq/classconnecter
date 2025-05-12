
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";

export const TutorsFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  
  // Filter states
  const [selectedSubject, setSelectedSubject] = useState<string>(searchParams.get('subject') || "");
  const [selectedCity, setSelectedCity] = useState<string>(searchParams.get('city') || "");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseInt(searchParams.get('min_price') || "0"), 
    parseInt(searchParams.get('max_price') || "5000")
  ]);
  const [minRating, setMinRating] = useState<number>(parseInt(searchParams.get('min_rating') || "0"));
  const [minExperience, setMinExperience] = useState<number>(parseInt(searchParams.get('min_experience') || "0"));
  const [verified, setVerified] = useState<boolean>(searchParams.get('verified') === 'true');
  
  useEffect(() => {
    // Fetch available subjects
    const fetchSubjects = async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
        
      if (error) {
        console.error('Error fetching subjects:', error);
        return;
      }
      
      setSubjects(data || []);
    };
    
    // Fetch distinct cities
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('city')
        .eq('role', 'tutor')
        .not('city', 'is', null)
        .order('city');
        
      if (error) {
        console.error('Error fetching cities:', error);
        return;
      }
      
      if (data) {
        // Extract unique cities
        const uniqueCities = [...new Set(data
          .map(item => item.city)
          .filter(Boolean) as string[]
        )];
        
        setCities(uniqueCities);
      }
    };
    
    fetchSubjects();
    fetchCities();
  }, []);
  
  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    
    if (selectedSubject) params.set('subject', selectedSubject);
    if (selectedCity) params.set('city', selectedCity);
    if (priceRange[0] > 0) params.set('min_price', priceRange[0].toString());
    if (priceRange[1] < 5000) params.set('max_price', priceRange[1].toString());
    if (minRating > 0) params.set('min_rating', minRating.toString());
    if (minExperience > 0) params.set('min_experience', minExperience.toString());
    if (verified) params.set('verified', 'true');
    
    setSearchParams(params);
  };
  
  const handleResetFilters = () => {
    setSelectedSubject("");
    setSelectedCity("");
    setPriceRange([0, 5000]);
    setMinRating(0);
    setMinExperience(0);
    setVerified(false);
    
    setSearchParams({});
  };
  
  return (
    <Card>
      <CardContent className="p-4 space-y-5">
        <h3 className="font-semibold text-lg mb-2">Фильтры</h3>
        
        {/* Subject filter */}
        <div>
          <Label htmlFor="subject" className="mb-1 block">Предмет</Label>
          <Select
            value={selectedSubject}
            onValueChange={setSelectedSubject}
          >
            <SelectTrigger id="subject">
              <SelectValue placeholder="Выберите предмет" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все предметы</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* City filter */}
        <div>
          <Label htmlFor="city" className="mb-1 block">Город</Label>
          <Select
            value={selectedCity}
            onValueChange={setSelectedCity}
          >
            <SelectTrigger id="city">
              <SelectValue placeholder="Выберите город" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все города</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Price range filter */}
        <div>
          <Label className="mb-3 block">Стоимость (₽/час)</Label>
          <div className="pt-4">
            <Slider
              defaultValue={priceRange}
              min={0}
              max={5000}
              step={100}
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="mb-2"
            />
            <div className="flex justify-between">
              <span className="text-sm">{priceRange[0]} ₽</span>
              <span className="text-sm">{priceRange[1]} ₽</span>
            </div>
          </div>
        </div>
        
        {/* Minimum rating filter */}
        <div>
          <Label htmlFor="rating" className="mb-1 block">Минимальный рейтинг</Label>
          <Select
            value={minRating.toString()}
            onValueChange={(value) => setMinRating(parseInt(value))}
          >
            <SelectTrigger id="rating">
              <SelectValue placeholder="Выберите минимальный рейтинг" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Любой рейтинг</SelectItem>
              <SelectItem value="3">От 3 звезд</SelectItem>
              <SelectItem value="4">От 4 звезд</SelectItem>
              <SelectItem value="4.5">От 4.5 звезд</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Minimum experience filter */}
        <div>
          <Label htmlFor="experience" className="mb-1 block">Опыт преподавания</Label>
          <Select
            value={minExperience.toString()}
            onValueChange={(value) => setMinExperience(parseInt(value))}
          >
            <SelectTrigger id="experience">
              <SelectValue placeholder="Выберите опыт" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Любой опыт</SelectItem>
              <SelectItem value="1">От 1 года</SelectItem>
              <SelectItem value="3">От 3 лет</SelectItem>
              <SelectItem value="5">От 5 лет</SelectItem>
              <SelectItem value="10">От 10 лет</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Education verification filter */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="verified" 
            checked={verified}
            onCheckedChange={(checked) => setVerified(checked as boolean)}
          />
          <Label htmlFor="verified" className="cursor-pointer">
            Подтвержденное образование
          </Label>
        </div>
        
        {/* Filter actions */}
        <div className="pt-4 space-y-2">
          <Button className="w-full" onClick={handleApplyFilters}>
            Применить фильтры
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleResetFilters}
          >
            Сбросить фильтры
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
