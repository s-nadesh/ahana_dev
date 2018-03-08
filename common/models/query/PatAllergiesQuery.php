<?php

namespace common\models\query;

class PatAllergiesQuery extends CommonQuery {

    public function tenantWithNull($tenant_id = NULL) {
        if ($tenant_id == null && empty($tenant_id))
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;
        return $this->andWhere(['tenant_id' => $tenant_id])->orWhere(['tenant_id' => null]);
    }

}
