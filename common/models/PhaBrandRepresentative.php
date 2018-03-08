<?php

namespace common\models;

use common\models\query\PhaBrandRepresentativeQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pha_brand_representative".
 *
 * @property integer $rep_id
 * @property integer $tenant_id
 * @property integer $brand_id
 * @property integer $division_id
 * @property string $rep_1_name
 * @property string $rep_1_contact
 * @property string $rep_1_designation
 * @property string $rep_2_name
 * @property string $rep_2_contact
 * @property string $rep_2_designation
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PhaBrand $brand
 * @property PhaBrandDivision $division
 * @property CoTenant $tenant
 */
class PhaBrandRepresentative extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_brand_representative';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['brand_id', 'division_id', 'rep_1_name', 'rep_1_contact', 'rep_1_designation'], 'required'],
                [['tenant_id', 'brand_id', 'division_id', 'created_by', 'modified_by'], 'integer'],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['rep_1_name', 'rep_2_name'], 'string', 'max' => 50],
                [['rep_1_contact', 'rep_1_designation', 'rep_2_contact', 'rep_2_designation'], 'string', 'max' => 100],
                [['brand_id'], 'unique', 'targetAttribute' => ['tenant_id', 'brand_id', 'division_id', 'deleted_at'], 'comboNotUnique' => 'The combination of Brand Name and Brand Division has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'rep_id' => 'Rep ID',
            'tenant_id' => 'Tenant ID',
            'brand_id' => 'Brand Name',
            'division_id' => 'Division Name',
            'rep_1_name' => 'Rep 1 Name',
            'rep_1_contact' => 'Rep 1 Contact',
            'rep_1_designation' => 'Rep 1 Designation',
            'rep_2_name' => 'Rep 2 Name',
            'rep_2_contact' => 'Rep 2 Contact',
            'rep_2_designation' => 'Rep 2 Designation',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getBrand() {
        return $this->hasOne(PhaBrand::className(), ['brand_id' => 'brand_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getDivision() {
        return $this->hasOne(PhaBrandDivision::className(), ['division_id' => 'division_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new PhaBrandRepresentativeQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'brand_name' => function ($model) {
                return (isset($model->brand) ? $model->brand->brand_name : '-');
            },
            'brand_code' => function ($model) {
                return (isset($model->brand) ? $model->brand->brand_code : '-');
            },
            'division_name' => function ($model) {
                return (isset($model->division) ? $model->division->division_name : '-');
            }
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Brand Representatives Added Successfully (#' . $this->rep_1_name . ' )';
        else
            $activity = 'Brand Representatives Updated Successfully (#' . $this->rep_1_name . ' )';
        CoAuditLog::insertAuditLog(PhaBrandRepresentative::tableName(), $this->rep_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
