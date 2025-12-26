import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

// Tipos de iconos disponibles
export type IconName = 
  | "trophy" 
  | "people" 
  | "home" 
  | "briefcase" 
  | "gamepad" 
  | "football" 
  | "music" 
  | "book" 
  | "airplane" 
  | "heart"
  | "star"
  | "fire"
  | "diamond"
  | "target"
  | "celebration"
  | "medal"
  | "crown"
  | "ribbon";

// Mapeo de iconos para grupos
export const groupIconOptions: IconName[] = [
  "trophy",
  "people", 
  "home",
  "briefcase",
  "gamepad",
  "football",
  "music",
  "book",
  "star",
  "heart",
];

// Mapeo de iconos para premios
export const awardIconOptions: IconName[] = [
  "trophy",
  "star",
  "medal",
  "crown",
  "diamond",
  "ribbon",
  "fire",
  "target",
];

// Función para obtener el componente de icono
export const getIconComponent = (iconName: IconName, size: number = 24, color: string = "#000") => {
  const iconMap: Record<IconName, { library: "ionicons" | "material"; name: string }> = {
    trophy: { library: "ionicons", name: "trophy" },
    people: { library: "ionicons", name: "people" },
    home: { library: "ionicons", name: "home" },
    briefcase: { library: "ionicons", name: "briefcase" },
    gamepad: { library: "ionicons", name: "game-controller" },
    football: { library: "ionicons", name: "football" },
    music: { library: "ionicons", name: "musical-notes" },
    book: { library: "ionicons", name: "book" },
    airplane: { library: "ionicons", name: "airplane" },
    heart: { library: "ionicons", name: "heart" },
    star: { library: "ionicons", name: "star" },
    fire: { library: "ionicons", name: "flame" },
    diamond: { library: "ionicons", name: "diamond" },
    target: { library: "material", name: "target" },
    celebration: { library: "material", name: "party-popper" },
    medal: { library: "ionicons", name: "medal" },
    crown: { library: "material", name: "crown" },
    ribbon: { library: "ionicons", name: "ribbon" },
  };

  const icon = iconMap[iconName] || iconMap.trophy;

  if (icon.library === "material") {
    return <MaterialCommunityIcons name={icon.name as any} size={size} color={color} />;
  }
  return <Ionicons name={icon.name as any} size={size} color={color} />;
};

export const getOutlinedIconComponent = (
  iconName: IconName, 
  size: number = 24, 
  fillColor: string = "#000",
  strokeColor: string = "#2A8A70",
  strokeWidth: number = 2
) => {
  return (
    <View style={{ position: 'relative', width: size, height: size }}>
      {/* Stroke layer - slightly larger icons in 4 directions */}
      <View style={{ position: 'absolute', top: -strokeWidth/2, left: 0 }}>
        {getIconComponent(iconName, size, strokeColor)}
      </View>
      <View style={{ position: 'absolute', top: strokeWidth/2, left: 0 }}>
        {getIconComponent(iconName, size, strokeColor)}
      </View>
      <View style={{ position: 'absolute', top: 0, left: -strokeWidth/2 }}>
        {getIconComponent(iconName, size, strokeColor)}
      </View>
      <View style={{ position: 'absolute', top: 0, left: strokeWidth/2 }}>
        {getIconComponent(iconName, size, strokeColor)}
      </View>
      {/* Fill layer on top */}
      <View style={{ position: 'absolute', top: 0, left: 0 }}>
        {getIconComponent(iconName, size, fillColor)}
      </View>
    </View>
  );
};

// Valor por defecto
export const defaultGroupIcon: IconName = "trophy";
export const defaultAwardIcon: IconName = "trophy";
