<?php

namespace common\models\query;

use Yii;

class CoRoleQuery extends CommonQuery {

    public function superRole() {
        return $this->andWhere('created_by < 0');
    }

    public function exceptSuperRole() {
        return $this->andWhere('created_by > 0');
    }
    
    public function myRoles($created_by = null) {
        if ($created_by == null && empty($created_by))
            $created_by = Yii::$app->user->identity->user->user_id;
        
        return $this->andWhere(['created_by' => $created_by]);
    }
}
