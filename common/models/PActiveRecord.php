<?php

namespace common\models;

use Yii;
use yii\db\ActiveQuery;
use yii\db\Connection;
use common\models\AppConfiguration;
use common\models\CoTenant;

class PActiveRecord extends RActiveRecord {

    public static function getDb() {
        $pharmacy_connection = '';
        $request = Yii::$app->request;
        $get_path = $request->pathInfo;
        $get_path = preg_replace('/[0-9]+/', '', $get_path);
        //$product_path = array("v1/pharmacyproduct/getgenericlistbydrugclass", "v1/pharmacyproduct/getdrugproductbygeneric", "v1/pharmacyproduct/getproductlistbygeneric",
        //"v1/pharmacyproduct", "v1/pharmacydrugclass", "v1/genericname", "v1/patientprescription/getdiagnosis", "v1/pharmacyproduct/getprescription", "v/pharmacyproducts/");
        $product_path = array("v/pharmacyproduct/getgenericlistbydrugclass", "v/pharmacyproduct/getdrugproductbygeneric", "v/pharmacyproduct/getproductlistbygeneric",
            "v/pharmacyproduct", "v/pharmacydrugclass", "v/genericname", "v/patientprescription/getdiagnosis", "v/pharmacyproduct/getprescription", "v/pharmacyproducts/");
        if (in_array("$get_path", $product_path)) {
            $get_action = $request->get('page_action');
            if ($get_action == 'branch_pharmacy') {
                $tenant_id = Yii::$app->user->identity->logged_tenant_id;
                $appConfiguration = AppConfiguration::find()
                        ->andWhere(['<>', 'value', 0])
                        ->andWhere(['tenant_id' => $tenant_id, 'code' => 'PB'])
                        ->one();
                if (!empty($appConfiguration)) {
                    $tenant_id = $appConfiguration['value'];
                    if ((isset(Yii::$app->session['pharmacy_tenant']) && (Yii::$app->session['pharmacy_tenant'] != $tenant_id)) || empty(Yii::$app->session['pharmacy_tenant'])) {
                        $organization = CoTenant::find()
                                ->joinWith(['coOrganization'])
                                ->andWhere(['tenant_id' => $tenant_id])
                                ->one();
                        if ($organization && (Yii::$app->user->identity->user->org_id != $organization->coOrganization->org_id)) {
                            $conn_dsn = "mysql:host={$organization->coOrganization->org_db_host};dbname={$organization->coOrganization->org_db_pharmacy}";
                            $conn_username = $organization->coOrganization->org_db_username;
                            $conn_password = $organization->coOrganization->org_db_password;

                            $pharmacy_connection = new Connection([
                                'dsn' => $conn_dsn,
                                'username' => $conn_username,
                                'password' => $conn_password,
                                'charset' => 'utf8'
                            ]);
                            $phar_connection = $pharmacy_connection->open();
                            Yii::$app->session['pharmacy_tenant'] = $tenant_id;
                            Yii::$app->session['pharmacy_tenant_db'] = $pharmacy_connection;
                        }
                    } else {
                        $pharmacy_connection = Yii::$app->session['pharmacy_tenant_db'];
                    }
                }
            }
        }
        if ($pharmacy_connection) {
            //print_r($pharmacy_connection); die;
            return Yii::$app->session['pharmacy_tenant_db'];
        } else {
            return Yii::$app->client_pharmacy;
        }
    }

}
