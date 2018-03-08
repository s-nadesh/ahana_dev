<?php

namespace common\models\query;

class CoRoomChargeSubcategoryQuery extends CommonQuery {

    public function categoryid($id = NULL) {
        if (!empty($id))
            return $this->andWhere(['charge_cat_id' => $id]);
        else
            return $this->andWhere('charge_cat_id is not null');
    }

}
