import axios from "axios";
const BASE_URL = process.env.MANAGER_URL;

export interface RegisterMatchInterface {
  game_id: string;
  player_white: string;
  player_black: string;
  is_bet: boolean;
  bet_amount: number;
}

// game_id:str
// quitter_player:Optional[str]
// winner_player:Optional[str]
// unexpected_leaver_player:Optional[str]
// is_quit:Optional[bool]
// is_completed:Optional[bool]
// is_draw:Optional[bool]
// is_timeout:Optional[bool]


export interface UpdateMatchInterface {
  game_id:string
  winner_player?:string
  quitter_player?:string
  unexpected_leaver_player?:string
  is_quit?:boolean
  is_completed?:boolean
  is_draw?:boolean
  is_timeout?:boolean
}

export const RegisterMatch = async (data: RegisterMatchInterface) => {
  try {
    const response = await axios.post(`${BASE_URL}api/matches/`, data, {
      headers: {
        Authorization: `Bearer ${process.env.MANAGER_AUTH_TOKEN}`,
      },
    });
    console.log("Response:", JSON.stringify(response.data)); // Log the response data
    return response.data;
  } catch (error) {
    console.error("Error making POST request:", error);
  }
};


export const UpdateMatch = async (data: RegisterMatchInterface) => {
  try {
    const response = await axios.patch(`${BASE_URL}api/matches/`, data, {
      headers: {
        Authorization: `Bearer ${process.env.MANAGER_AUTH_TOKEN}`,
      },
    });
    console.log("Response:", JSON.stringify(response.data)); // Log the response data
    return response.data;
  } catch (error) {
    console.error("Error making POST request:", error);
  }
};

