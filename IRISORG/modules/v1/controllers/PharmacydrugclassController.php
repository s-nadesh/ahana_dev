<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PhaDrugClass;
use common\models\PhaDrugGeneric;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PharmacydrugclassController extends ActiveController {

    public $modelClass = 'common\models\PhaDrugClass';

    public function behaviors() {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => QueryParamAuth::className()
        ];
        $behaviors['contentNegotiator'] = [
            'class' => ContentNegotiator::className(),
            'formats' => [
                'application/json' => Response::FORMAT_JSON,
            ],
        ];

        return $behaviors;
    }

    public function actions() {
        $actions = parent::actions();
        $actions['index']['prepareDataProvider'] = [$this, 'prepareDataProvider'];

        return $actions;
    }

    public function prepareDataProvider() {
        /* @var $modelClass BaseActiveRecord */
        $modelClass = $this->modelClass;

        return new ActiveDataProvider([
            'query' => $modelClass::find()->tenant()->active()->orderBy(['created_at' => SORT_DESC]),
            'pagination' => false,
        ]);
    }

    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('id');
        if ($id) {
            $model = PhaDrugClass::find()->where(['drug_class_id' => $id])->one();
            $model->remove();
            $activity = 'Drug Class Deleted Successfully (#' . $model->drug_name . ' )';
            CoAuditLog::insertAuditLog(PhaDrugClass::tableName(), $id, $activity);
            return ['success' => true];
        }
    }

    public function actionGetdruglist() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['tenant']))
            $tenant = $get['tenant'];

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        if (isset($get['notUsed']))
            $notUsed = $get['notUsed'] == 'true';

        return ['drugList' => PhaDrugClass::getDruglist($tenant, $status, $deleted, $notUsed)];
    }

    public function actionGetdrugbygeneric() {
        $generic_id = Yii::$app->request->get('generic_id');
        if (!empty($generic_id)) {
            $drug = PhaDrugGeneric::find()->tenant()->status()->active()->andWhere(['generic_id' => $generic_id])->one();
            return ['success' => true, 'drug' => $drug];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    public function actionGetdrugclass() {
        $requestData = $_REQUEST;
        $modelClass = $this->modelClass;
        $totalData = $modelClass::find()->tenant()->active()->count();
        $totalFiltered = $totalData;

        // Order Records
        if (isset($requestData['order'])) {
            if ($requestData['order'][0]['dir'] == 'asc') {
                $sort_dir = SORT_ASC;
            } elseif ($requestData['order'][0]['dir'] == 'desc') {
                $sort_dir = SORT_DESC;
            }
            $order_array = [$requestData['columns'][$requestData['order'][0]['column']]['data'] => $sort_dir];
        }

        if (!empty($requestData['search']['value'])) {
            $totalFiltered = $modelClass::find()
                    ->tenant()
                    ->active()
                    ->andFilterWhere([
                        'OR',
                            ['like', 'drug_name', $requestData['search']['value']],
                    ])
                    ->count();

            $drugClass = $modelClass::find()
                    ->tenant()
                    ->active()
                    ->andFilterWhere([
                        'OR',
                            ['like', 'drug_name', $requestData['search']['value']],
                    ])
                    ->limit($requestData['length'])
                    ->offset($requestData['start'])
                    ->orderBy($order_array)
                    ->all();
        } else {
            $drugClass = $modelClass::find()
                    ->tenant()
                    ->active()
                    ->limit($requestData['length'])
                    ->offset($requestData['start'])
                    ->orderBy($order_array)
                    ->all();
        }

        $data = array();
        foreach ($drugClass as $drug) {
            $nestedData = array();
            $nestedData['drug_name'] = $drug->drug_name;
            $nestedData['status'] = $drug->status;
            $nestedData['drug_class_id'] = $drug->drug_class_id;
            $data[] = $nestedData;
        }

        $json_data = array(
            "draw" => intval($requestData['draw']),
            "recordsTotal" => intval($totalData),
            "recordsFiltered" => intval($totalFiltered),
            "data" => $data   // total data array
        );

        echo json_encode($json_data);
    }

}
