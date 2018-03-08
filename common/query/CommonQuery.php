<?php

namespace common\models\query;

use Yii;
use yii\db\ActiveQuery;
use common\models\AppConfiguration;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of CoRoleQuery
 *
 * @author ark-05
 */
class CommonQuery extends ActiveQuery {

    public $tblName;

    public function __construct($modelClass, $config = array()) {
        $this->tblName = $modelClass::tableName();

        parent::__construct($modelClass, $config);
    }

    public function tenant($tenant_id = NULL) {
        $request = Yii::$app->request;
        $get_path = $request->pathInfo;
        $product_path = array("v1/pharmacyproduct/getgenericlistbydrugclass", "v1/pharmacyproduct/getdrugproductbygeneric", "v1/pharmacyproduct/getproductlistbygeneric",
            "v1/pharmacyproduct", "v1/pharmacydrugclass", "v1/genericname", "v1/patientprescription/getdiagnosis", "v1/pharmacyproduct/getprescription");
        if (in_array("$get_path", $product_path)) {
            $get_action = $request->get('page_action');
            if ($get_action == 'branch_pharmacy') {
                $tenant_id = Yii::$app->user->identity->logged_tenant_id;
                $appConfiguration = AppConfiguration::find()
                         ->andWhere(['<>','value', 0])
                        ->andWhere(['tenant_id' => $tenant_id, 'code' => 'PB'])
                        ->one();
                if (!empty($appConfiguration)) {
                    $tenant_id = $appConfiguration['value'];
                }
            }
        }
        if ($tenant_id == null && empty($tenant_id))
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;

        return $this->andWhere(["{$this->tblName}.tenant_id" => $tenant_id]);
    }

    public function status($status = '1') {
        if (strpos($status, ',') !== false) {
            $status = explode(',', $status);
        }
        return $this->andWhere(["{$this->tblName}.status" => $status]);
    }

    public function active() {
        return $this->andWhere("{$this->tblName}.deleted_at = '0000-00-00 00:00:00'");
    }

    public function deleted() {
        return $this->andWhere("{$this->tblName}.deleted_at != '0000-00-00 00:00:00'");
    }

}
