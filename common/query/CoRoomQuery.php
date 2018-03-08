<?php

namespace common\models\query;

class CoRoomQuery extends CommonQuery {
    
    public function occupiedStatus($occupied_status = NULL) {
        if($occupied_status == null && empty($occupied_status)){
            return $this->andWhere(['>=', 'occupied_status', "0"]);
        } else {
            return $this->andWhere(['occupied_status' => $occupied_status]);
        }
    }


}
