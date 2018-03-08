<?php

namespace common\models\query;

class CoInternalCodeQuery extends CommonQuery {

    public function codeType($codeType = 'B') {
        return $this->andWhere(['code_type' => $codeType]);
    }

}
