<?php

namespace common\models\query;

use Yii;

class CoChargePerSubcategoryQuery extends CommonQuery {

    public function categoryid($id = NULL) {
        if (!empty($id))
            return $this->andWhere(['charge_id' => $id]);
        else
            return $this->andWhere('charge_id is not null');
    }

}
