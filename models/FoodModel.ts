import FoodDetailsModel from "./FoodDetailsModel";

interface FoodModel {
  id: number;
  name: String;
  description: String;
  user_id: Number;
  details: FoodDetailsModel;
}

export default FoodModel;
