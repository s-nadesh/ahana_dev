<?php

namespace IRISORG\modules\v1\controllers;

use common\models\CoRoom;
use common\models\PatAdmission;
use common\models\PatEncounter;
use Yii;
use yii\bootstrap\Html;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\Json;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class AdmissionController extends ActiveController {

    public $modelClass = 'common\models\PatAdmission';

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
            $model = PatAdmission::find()->where(['city_id' => $id])->one();
            $model->remove();
            return ['success' => true];
        }
    }

    public function actionPatientswap() {
        $post = Yii::$app->getRequest()->post();

        $model = new PatAdmission();
        $model->scenario = 'swap';
        $model->attributes = $post;
        $model->isSwapping = true;

        $valid = $model->validate();

        if ($valid) {
            //Swap Patient 1
            $patient_1_model = new PatAdmission();
            $patient_1_model->attributes = [
                'status_date' => $post['status_date'],
                'encounter_id' => $post['encounter_id'],
                'patient_id' => $post['patient_id'],
                'floor_id' => $post['swapFloorId'],
                'ward_id' => $post['swapWardId'],
                'room_id' => $post['swapRoomId'],
                'room_type_id' => $post['swapRoomTypeId'],
                'admission_status' => $post['admission_status'],
                'is_swap' => 1,
                'notes' => Json::encode([
                    'encounter_id' => $post['swapEncounterId'],
                    'patient_id' => $post['swapPatientId'],
                    'floor_id' => $post['floor_id'],
                    'ward_id' => $post['ward_id'],
                    'room_id' => $post['room_id'],
                    'room_type_id' => $post['room_type_id'],
                ]),
            ];
            $patient_1_model->isSwapping = true;
            $valid = $patient_1_model->validate() && $valid;

            //Swap Patient 2
            $patient_2_model = new PatAdmission();
            $patient_2_model->attributes = [
                'status_date' => $post['status_date'],
                'encounter_id' => $post['swapEncounterId'],
                'patient_id' => $post['swapPatientId'],
                'floor_id' => $post['floor_id'],
                'ward_id' => $post['ward_id'],
                'room_id' => $post['room_id'],
                'room_type_id' => $post['room_type_id'],
                'admission_status' => $post['admission_status'],
                'is_swap' => 1,
                'notes' => Json::encode([
                    'encounter_id' => $post['encounter_id'],
                    'patient_id' => $post['patient_id'],
                    'floor_id' => $post['swapFloorId'],
                    'ward_id' => $post['swapWardId'],
                    'room_id' => $post['swapRoomId'],
                    'room_type_id' => $post['swapRoomTypeId'],
                ]),
            ];
            $patient_2_model->isSwapping = true;
            $valid = $patient_2_model->validate() && $valid;

            if ($valid) {
                $patient_1_model->save();
                $patient_2_model->save();

                return ['success' => true];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$patient_1_model, $patient_2_model])];
            }
        } else {
            return ['success' => false, 'message' => Html::errorSummary([$model])];
        }
    }

    public function actionCanceladmission() {
        $post = Yii::$app->getRequest()->post();

        if (!empty($post)) {
            $model = false;

            switch ($post['row_sts']) {
                case 'TR':
                    $model = $this->canCancelTransfer($post['admn_id']);
                    break;
                case 'TD':
                    $model = $this->canCancelDoctor($post['admn_id']);
                    break;
                case 'SW':
                    $ret = $this->canCancelSwap($post['admn_id']);

                    $model = $ret['model'];
                    $patient_admission_model = $ret['patient_admission_model'];
                    break;
                case 'CD':
                    $model = $this->canCancelClinicalDischarge($post['admn_id']);
                    break;
                case 'TB':
                    $model = $this->canCancelTransferRoom($post['admn_id']);
                    break;
            }

            if ($model == false)
                return ['success' => false, 'message' => "You can't cancel this admission"];

            $model->attributes = $post;

            $valid = $model->validate();
            if ($valid) {
                $model->save(false);
                $model->remove();

                if (($post['row_sts'] == 'TR') || ($post['row_sts'] == 'TB')) {
                    //Get Last Row
                    $new_model = PatAdmission::find()->where(['admn_id' => $post['admn_id']])->one();
                    $last_admission = $new_model->encounter->patLastRoomAdmission[0];

                    //Vacent the Cancelled Status Room
                    $this->saveRoom($new_model->room_id, 0);

                    //Occupy the Old Status Room
                    $this->saveRoom($last_admission->room_id, 1);
                    if ($post['row_sts'] == 'TB') {
                        $encounter = PatEncounter::find()->where(['encounter_id' => $last_admission->encounter_id])->one();
                        $encounter->current_tenant_id = $last_admission->tenant_id;
                        $encounter->patient_id = $last_admission->patient_id;
                        $encounter->save(false);
                    }
                } else if ($post['row_sts'] == 'SW') {
                    $patient_admission_model->status_date = date('Y-m-d H:i:s');
                    $patient_admission_model->status = '0';
                    $patient_admission_model->admission_status = 'C';
                    $patient_admission_model->notes = 'Room Swapping cancelled';
                    $patient_admission_model->save(false);
                    $patient_admission_model->remove();
                }

                return ['success' => true];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$model])];
            }
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    private function canCancelTransfer($admn_id) {
        $model = PatAdmission::find()->where(['admn_id' => $admn_id])->one();

        if (empty($model))
            return false;

        return $this->checkRoomVacant($model->encounter->patLastRoomAdmission[1]->room_id) ? $model : false;
    }

    private function canCancelTransferRoom($admn_id) {
        $model = PatAdmission::find()->where(['admn_id' => $admn_id])->one();

        if (empty($model))
            return false;
        //Checking patient Billing payment model
        $billPayment = \common\models\PatBillingPayment::find()->tenant()->active()->andWhere(['encounter_id' => $model->encounter_id])->one();
        if (!empty($billPayment))
            return false;
        //Checking patient Billing Other charge model
        $billOtherCharges = \common\models\PatBillingOtherCharges::find()->tenant()->active()->andWhere(['encounter_id' => $model->encounter_id])->one();
        if (!empty($billOtherCharges))
            return false;
        //Checking patient Consultant model
        $consultant = \common\models\PatConsultant::find()->tenant()->active()->andWhere(['encounter_id' => $model->encounter_id])->one();
        if (!empty($consultant))
            return false;
        //Checking patient Procedure model
        $procedure = \common\models\PatProcedure::find()->tenant()->active()->andWhere(['encounter_id' => $model->encounter_id])->one();
        if (!empty($procedure))
            return false;
        return $this->checkRoomVacant($model->encounter->patLastRoomAdmission[1]->room_id) ? $model : false;
    }

    private function canCancelDoctor($admn_id) {
        $model = PatAdmission::find()->where(['admn_id' => $admn_id])->one();

        if (empty($model))
            return false;

        return $model;
    }

    private function canCancelSwap($admn_id) {
        $model = PatAdmission::find()->where(['admn_id' => $admn_id])->one();

        if (empty($model))
            return false;

        $patient_2_data = Json::decode($model->notes);
        $patient_2_encounter_id = $patient_2_data['encounter_id'];
        $patient_2_encounter = PatEncounter::find()->where(['encounter_id' => $patient_2_encounter_id])->one();
        $patient_2_admission = $patient_2_encounter->patCurrentAdmission;

        //Validate Swap Patient is in the Same Room
        if ($patient_2_data['room_id'] != $patient_2_admission->room_id && $patient_2_admission->is_swap == 1)
            return false;

        return [
            'model' => $model,
            'patient_admission_model' => $patient_2_encounter->patCurrentAdmission,
        ];
    }

    private function checkRoomVacant($room_id) {
        $model = CoRoom::find()->where(['room_id' => $room_id])->one();

        if (!empty($model))
            return ($model->occupied_status == '0');
        else
            return false;
    }

    private function saveRoom($room_id, $occ_sts) {
        $room = CoRoom::find()->where(['room_id' => $room_id])->one();
        $room->occupied_status = $occ_sts;
        $room->save(false);
    }

    private function canCancelClinicalDischarge($admn_id) {
        $model = PatAdmission::find()->where(['admn_id' => $admn_id])->one();
        if (empty($model))
            return false;

        $encounter = PatEncounter::find()->where(['encounter_id' => $model['encounter_id']])->one();
        if ($encounter->finalize != '0')
            return false;
        return $model;
    }

}
