<?php

namespace common\models\query;

use Yii;

class CoRoomChargeCategoryQuery extends CommonQuery {

    public function tenantWithNull($tenant_id = NULL) {
        if ($tenant_id == null && empty($tenant_id))
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;
        return $this->andWhere(['tenant_id' => $tenant_id])->orWhere(['tenant_id' => null]);
    }

    public function exceptCode() {
        return $this->andWhere('charge_cat_code NOT IN ("ALC", "PRC") OR charge_cat_code is NULL');
    }

}
