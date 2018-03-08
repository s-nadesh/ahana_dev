<?php

namespace common\models\query;

use common\models\PhaDrugGeneric;
use yii\helpers\ArrayHelper;

class PhaGenericQuery extends CommonQuery {

    public function notUsed() {
        $ids = ArrayHelper::map(PhaDrugGeneric::find()->all(), 'generic_id', 'generic_id');
        return $this->andWhere(['NOT IN', 'generic_id', $ids]);
    }

}
