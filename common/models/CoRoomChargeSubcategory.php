<?php

namespace common\models;

use common\models\query\CoRoomChargeSubcategoryQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_room_charge_subcategory".
 *
 * @property integer $charge_subcat_id
 * @property integer $tenant_id
 * @property integer $charge_cat_id
 * @property string $charge_subcat_name
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoRoomChargeCategory $chargeCat
 * @property CoTenant $tenant
 */
class CoRoomChargeSubcategory extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_room_charge_subcategory';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['charge_cat_id', 'charge_subcat_name'], 'required'],
            [['tenant_id', 'charge_cat_id', 'created_by', 'modified_by'], 'integer'],
            [['status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at'], 'safe'],
            [['charge_subcat_name'], 'string', 'max' => 50],
            [['tenant_id'], 'unique', 'targetAttribute' => ['tenant_id', 'charge_cat_id', 'charge_subcat_name', 'deleted_at'], 'message' => 'The combination of Subcategory Name has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'charge_subcat_id' => 'Charge Subcat ID',
            'tenant_id' => 'Tenant',
            'charge_cat_id' => 'Charge Category',
            'charge_subcat_name' => 'Charge Name',
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
    public function getChargeCat() {
        return $this->hasOne(CoRoomChargeCategory::className(), ['charge_cat_id' => 'charge_cat_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new CoRoomChargeSubcategoryQuery(get_called_class());
    }

    public static function getRoomChargeSubCateogrylist($tenant = null, $status = '1', $deleted = false, $cat_id = null) {
        if (!$deleted)
            $list = self::find()->tenant($tenant)->status($status)->categoryid($cat_id)->active()->all();
        else
            $list = self::find()->tenant($tenant)->deleted()->categoryid($cat_id)->all();

        return $list;
    }

}
