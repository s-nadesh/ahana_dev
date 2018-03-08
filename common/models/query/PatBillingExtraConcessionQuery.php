<?php

namespace common\models\query;

class PatBillingExtraConcessionQuery extends CommonQuery {
    
    public function ectype($ec_type = 'P') {
        return $this->andWhere(['ec_type' => $ec_type]);
    }
}
