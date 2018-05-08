<?php

namespace IRISADMIN\modules\v1\controllers;

use common\models\CoCity;
use common\models\CoCountry;
use common\models\CoRole;
use common\models\CoRolesResources;
use common\models\CoState;
use common\models\CoUser;
use Yii;
use yii\filters\ContentNegotiator;
use yii\web\Controller;
use yii\web\Response;

class DefaultController extends Controller {

    public function behaviors() {
        $behaviors = parent::behaviors();

        $behaviors['contentNegotiator'] = [
            'class' => ContentNegotiator::className(),
            'formats' => [
                'application/json' => Response::FORMAT_JSON,
            ],
        ];

        return $behaviors;
    }

    public function actionIndex() {
        echo "Ahana IRISAdmin Web Service V1";
    }

    public function actionGetCountryList() {
        $list = array();

        $data = CoCountry::getCountrylist();
        foreach ($data as $value => $label) {
            $list[] = array('value' => $value, 'label' => $label);
        }
        return ['countryList' => $list];
    }

    public function actionGetStateList() {
        $list = array();
        $datas = CoState::find()->all();
        foreach ($datas as $data) {
            $list[] = array('value' => $data->state_id, 'label' => $data->state_name, 'countryId' => $data->country_id);
        }
        return ['stateList' => $list];
    }

    public function actionGetCityList() {
        $list = array();
        $datas = CoCity::find()->all();
        foreach ($datas as $data) {
            $list[] = array('value' => $data->city_id, 'label' => $data->city_name, 'stateId' => $data->state_id);
        }
        return ['cityList' => $list];
    }

    public function actionChangeStatus() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            $modelName = $post['model'];
            $primaryKey = $post['id'];
            $modelClass = "common\\models\\$modelName";
            $model = $modelClass::findOne($primaryKey);
            $model->status = 1 - $model->status;
            $model->save(false);
            return ['success' => "ok", 'sts' => $model->status];
        }
    }

    public function actionChangePharmacy() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            $modelName = $post['model'];
            $primaryKey = $post['id'];
            $modelClass = "common\\models\\$modelName";
            $model = $modelClass::findOne($primaryKey);
            $model->pharmacy_setup = 1 - $model->pharmacy_setup;
            $model->save(false);
            return ['success' => "ok", 'sts' => $model->pharmacy_setup];
        }
    }

    public function actionGetModuleTree() {
        return ['moduleList' => CoRolesResources::getModuleTree()];
    }

    public function actionTesting() {
        $user = new CoUser;
        $user->tenant_id = 18;
        $user->name = 'Nadesh';
        $user->save(false);

        $role = new CoRole;
        $role->tenant_id = 18;
        $role->description = 'Nadesh_role';
        $role->save(false);

        $user->link('roles', $role);
        return ['success' => 'Ok'];
    }

    public function actionExample() {
        $user = CoUser::findOne(10);
        $roles = [CoRole::findOne(8)];

        $extraColumns = ['tenant_id' => '18']; // extra columns to be saved to the many to many table
        $unlink = true; // unlink tags not in the list
        $delete = true; // delete unlinked tags

        $user->linkAll('roles', $roles, $extraColumns, $unlink, $delete);
    }

}
