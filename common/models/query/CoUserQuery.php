<?php

namespace common\models\query;

use Yii;

class CoUserQuery extends CommonQuery {
    
    public function careprovider($care_provider = '1') {
        return $this->andWhere(['care_provider' => $care_provider]);
    }
    
    public function myUsers($created_by = null) {
        if ($created_by == null && empty($created_by))
            $created_by = Yii::$app->user->identity->user->user_id;
        
        return $this->andWhere(['created_by' => $created_by]);
    }
    
    public function exceptSuperUser() {
        return $this->andWhere('created_by > 0');
    }
    
}
