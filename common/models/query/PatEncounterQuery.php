<?php

namespace common\models\query;

use Yii;

class PatEncounterQuery extends CommonQuery {
    
    public function encounterType($type = 'IP') {
        if (strpos($type, ',') !== false) {
            $type = explode(',', $type);
        }
        return $this->andWhere(['encounter_type' => $type]);
    }

    public function unfinalized() {
        return $this->andWhere(['finalize' => 0]);
    }

    public function finalized() {
        return $this->andWhere('finalize > 0');
    }

    public function unauthorized() {
        return $this->andWhere(['authorize' => 0]);
    }
    
    public function authorized() {
        return $this->andWhere('authorize > 0');
    }

}
