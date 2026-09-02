// Image constants - Add more images here and reference by name
import hero1 from "../assets/hero1 .jpg";
import hero2 from "../assets/Hero2.jpg";
import hero3 from "../assets/hero3.jpg";
import about1 from "../assets/about1.png";
import about2 from "../assets/about2.png";
import about3 from "../assets/about3.png";
import about4 from "../assets/about4.png";
import about5 from "../assets/about5.jpg";
import telephone from "../assets/telephone.png";
import service01 from "../assets/service01.png";
import about6 from "../assets/about6.jpg";
import eyeTech from "../assets/eye-tech.jpg";
export const IMAGES = {
  hero1: hero1,
  hero2: hero2,
  hero3: hero3,
  about1: about1,
  about2: about2,
  about3: about3,
  about4: about4,
  about5: about5,
  telephone: telephone,
  service01: service01,
  about6: about6,
  eyeTech: eyeTech
};

// Shorthand function to get image by name
export const getImage = (imageName) => {
  console.log("Getting image:", imageName, "Result:", IMAGES[imageName]); // DEBUG
  return IMAGES[imageName] || IMAGES.hero1; // Default to hero1 if image not found
};
