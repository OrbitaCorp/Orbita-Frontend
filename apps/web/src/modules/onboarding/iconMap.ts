import {
  type LucideIcon,
  ShoppingBag, CalendarDays, UtensilsCrossed, Wrench, Plane, GraduationCap, PartyPopper,
  Scissors, Sparkles, Brain, Dumbbell, Camera, Coffee, Hospital,
  Scale, Briefcase, Car, PawPrint, Home, BookOpen, Wine, Hotel,
  Smile, Disc3,
  Shirt, Footprints, Smartphone, Hammer, Package2, Gift,
  Gem, Sofa, Monitor, Package, Droplets, Sprout, Palette, Store,
  HelpCircle,
} from 'lucide-react'

// El backend manda el nombre del ícono como string (no puede serializar JSX) —
// este mapa es lo único que traduce esa clave a un componente real. Si el
// catálogo de rubros (apps/api/src/onboarding/onboarding.service.ts) suma un
// ícono nuevo, hay que agregarlo acá también.
const ICONS: Record<string, LucideIcon> = {
  ShoppingBag, CalendarDays, UtensilsCrossed, Wrench, Plane, GraduationCap, PartyPopper,
  Scissors, Sparkles, Brain, Dumbbell, Camera, Coffee, Hospital,
  Scale, Briefcase, Car, PawPrint, Home, BookOpen, Wine, Hotel,
  Smile, Disc3,
  Shirt, Footprints, Smartphone, Hammer, Package2, Gift,
  Gem, Sofa, Monitor, Package, Droplets, Sprout, Palette, Store,
}

export function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? HelpCircle
}
