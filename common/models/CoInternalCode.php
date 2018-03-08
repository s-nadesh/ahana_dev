<?php

namespace common\models;

use common\models\query\CoInternalCodeQuery;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_internal_code".
 *
 * @property integer $internal_code_id
 * @property integer $tenant_id
 * @property string $code_type
 * @property string $code_prefix
 * @property integer $code
 * @property integer $code_padding
 * @property string $code_suffix
 * @property string $status 
 * @property string $created_at
 * @property integer $created_by
 * @property string $modified_at
 * @property integer $modified_by
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 */
class CoInternalCode extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_internal_code';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['code_prefix', 'code'], 'required'],
                [['tenant_id', 'code', 'code_padding', 'created_by', 'modified_by'], 'integer'],
                [['code_type'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['code_prefix', 'code_suffix'], 'string', 'max' => 10],
                [['tenant_id'], 'unique', 'targetAttribute' => ['tenant_id', 'code_type', 'deleted_at'], 'message' => 'The combination of Code Type has already been taken.'],
                ['code_padding', 'number', 'min' => 1, 'max' => 9],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'internal_code_id' => 'Internal Code ID',
            'tenant_id' => 'Tenant ID',
            'code_type' => 'Code Type',
            'code_prefix' => 'Code Prefix',
            'code' => 'Code Start No',
            'code_padding' => 'Code Padding',
            'code_suffix' => 'Code Suffix',
            'status' => 'Status',
            'created_at' => 'Created At',
            'created_by' => 'Created By',
            'modified_at' => 'Modified At',
            'modified_by' => 'Modified By',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new CoInternalCodeQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'fullcode' => function ($model) {
                return $model->fullcode;
            },
            'next_fullcode' => function ($model) {
                $prefix = $model->code_prefix;
                $int_code = str_pad(($model->code + 1), $model->code_padding, '0', STR_PAD_LEFT);
                //        $role_suffix = $this->Gen_Suffix;
                return "{$prefix}{$int_code}";
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public static function getInternalCode($tenant = null, $status = '1', $deleted = false, $code_type = 'B') {
        if (!$deleted)
            $list = self::find()->tenant($tenant)->status($status)->active()->codeType($code_type)->one();
        else
            $list = self::find()->tenant($tenant)->deleted()->codeType($code_type)->one();

        return $list;
    }

    public static function getCodeTypes() {
        //B-Bill, P-Patient, PU-Purchase, PR-PurchaseReturn , CS-CaseSheet, SA-Sale, SR-SaleReturn, PG - Purchase GR No.
        return array('B', 'P', 'PU', 'PR', 'CS', 'SA', 'SR', 'PG');
    }

    public function getFullcode() {
        $prefix = $this->code_prefix;
        $int_code = str_pad($this->code, $this->code_padding, '0', STR_PAD_LEFT);
//        $role_suffix = $this->Gen_Suffix;

        return "{$prefix}{$int_code}";
    }

    public static function increaseInternalCode($code_type) {
        $code = self::find()->tenant()->codeType($code_type)->one();
        if ($code) {
            $code->code = $code->code + 1;
            $code->save(false);
        }
    }

    public static function generateInternalCode($code_type, $model, $column) {
        $internal_code = self::find()->tenant()->codeType($code_type)->one();

        if (empty($internal_code)) {
            $user = Yii::$app->user->identity->user;
            $tenant_name = CoTenant::find($user->tenant_id)->one()->tenant_name;

            $internal_code = new CoInternalCode;
            $internal_code->tenant_id = $user->tenant_id;
            $internal_code->code_type = $code_type;
            $string = str_replace(' ', '-', $tenant_name);
            $string = preg_replace('/[^A-Za-z0-9\-]/', '', $string);
            $internal_code->code_prefix = strtoupper(substr($string, 0, 2));
            $internal_code->code = '1';
            $internal_code->code_padding = '7';
            $internal_code->save(false);
        }

        $code = $internal_code->Fullcode;

        do {
            $exists = $model::find()->tenant()->andWhere([$column => $code])->one();

            if (!empty($exists)) {
                $old_code = $code;
                self::increaseInternalCode($code_type);
                $code = self::find()->tenant()->codeType($code_type)->one()->Fullcode;
            } else {
                break;
            }
        } while ($old_code != $code);

        return $code;
    }

//    public function afterSave($insert, $changedAttributes) {
//        if ($insert)
//            $activity = 'Internal Code Added Successfully';
//        else
//            $activity = 'Internal Code Updated Successfully';
//        CoAuditLog::insertAuditLog(CoInternalCode::tableName(), $this->internal_code_id, $activity);
//        return parent::afterSave($insert, $changedAttributes);
//    }

}
