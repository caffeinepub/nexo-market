import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface Slide {
  image: string;
  title: string;
  description: string;
  cta: string;
  link: string;
}

const slides: Slide[] = [
  {
    image: '/assets/generated/nexo-market-hero.dim_1600x900.png',
    title: 'Welcome to Nexo Market',
    description: 'Discover amazing deals on thousands of products',
    cta: 'Shop Now',
    link: '/products',
  },
  {
    image: '/assets/generated/nexo-market-hero.dim_1600x900.png',
    title: 'Electronics Sale',
    description: 'Up to 50% off on selected electronics',
    cta: 'Browse Electronics',
    link: '/products?category=Electronics',
  },
  {
    image: '/assets/generated/nexo-market-hero.dim_1600x900.png',
    title: 'Fashion Trends',
    description: 'New arrivals in fashion and accessories',
    cta: 'Explore Fashion',
    link: '/products?category=Clothing',
  },
];

export default function HeroCarousel() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="relative h-full w-full">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
              <div className="container mx-auto px-4 sm:px-8">
                <div className="max-w-xl text-white">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-lg sm:text-xl mb-6">{slide.description}</p>
                  <Button
                    size="lg"
                    onClick={() => navigate({ to: slide.link as any })}
                    className="bg-[oklch(0.828_0.189_84.429)] hover:bg-[oklch(0.75_0.189_84.429)] text-[oklch(0.145_0_0)]"
                  >
                    {slide.cta}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
