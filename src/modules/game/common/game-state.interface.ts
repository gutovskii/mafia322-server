import { RoleEntity } from 'src/modules/role/entities/role.entity';
import { Effect } from './effect.enum';

export interface GameState {
  day: number;
  round: {
    summariesForNight: {
      killed: string[];
      fcked: string[];
      healed: string[];
    };
    voted: Map<string, number>;
  };
  players: {
    id: string;
    name: string;
    isDead: boolean;
    effects: Effect[];
    role: RoleEntity;
    hasActiveRole: boolean;
    hasDoneAction: boolean;
  }[];
}
