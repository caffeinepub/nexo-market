import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';

interface PromoCard {
  title: string;
  description: string;
  image: string;
  link: string;
}

const promoCards: PromoCard[] = [
  {
    title: 'Electronics Deals',
    description: 'Up to 40% off',
    image: '/assets/generated/cat-electronics.dim_256x256.png',
    link: '/products?category=Electronics',
  },
  {
    title: 'Fashion Sale',
    description: 'New arrivals',
    image: '/assets/generated/cat-fashion.dim_256x256.png',
    link: '/products?category=Clothing',
  },
  {
    title: 'Home Essentials',
    description: 'Starting at $9.99',
    image: '/assets/generated/cat-home.dim_256x256.png',
    link: '/products?category=Home',
  },
  {
    title: 'Beauty Products',
    description: 'Top brands',
    image: '/assets/generated/cat-beauty.dim_256x256.png',
    link: '/products?category=Beauty',
  },
];

export default function PromoGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {promoCards.map((promo, index) => (
        <Card
          key={index}
          className="cursor-pointer hover:shadow-lg transition-all overflow-hidden"
          onClick={() => navigate({ to: promo.link as any })}
        >
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-1">{promo.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{promo.description}</p>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={promo.image}
                alt={promo.title}
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
