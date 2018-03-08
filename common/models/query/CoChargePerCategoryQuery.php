<?php

namespace common\models\query;

class CoChargePerCategoryQuery extends CommonQuery {

    public function chargeCatType($type = 'P') {
        return $this->andWhere(['charge_cat_type' => $type]);
    }
    
    public function chargeCatId($charge_cat_id = '-1') {
        return $this->andWhere(['charge_cat_id' => $charge_cat_id]);
    }

}
