import FoodDetailsModel from './FoodDetailsModel'

interface FoodModel {
    id: number
    name: string
    image_path: string
    calories: number
    carbs: number
    fats: number
    proteins: number
    user_id: number
}

export default FoodModel
