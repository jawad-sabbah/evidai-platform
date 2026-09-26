import {
  Building2,
  CreditCard,
  Mail,
  MapPin,
  Network,
  User,
} from "lucide-react";

type EntityIconProps = {
  type: string;
  size?: number;
};

export function EntityIcon({
  type,
  size = 16,
}: EntityIconProps) {
  switch (type) {
    case "PERSON":
      return <User size={size} />;

    case "ORGANIZATION":
      return <Building2 size={size} />;

    case "BANK_ACCOUNT":
      return <CreditCard size={size} />;

    case "EMAIL":
      return <Mail size={size} />;

    case "LOCATION":
      return <MapPin size={size} />;

    default:
      return <Network size={size} />;
  }
}